import React, { useCallback, useEffect, useRef, useState } from "react";

const TARGETS = [
  { id: "about", label: "About", color: "#00d4ff" },
  { id: "work", label: "Work", color: "#ff6b9d" },
  { id: "contact", label: "Contact", color: "#ffd166" },
];

const DART_SIZE = 16;
const MAX_PULL = 110;
const POWER_SCALE = 18;
const GRAVITY = 1800;
const MAX_FLIGHT_TIME = 3;

export default function DartGame() {
  const containerRef = useRef(null);
  const targetRefs = useRef([]);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(null);
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const shotActiveRef = useRef(false);
  const anchorRef = useRef({ x: 0, y: 0 });
  const hitRef = useRef(false);
  const flightStartRef = useRef(null);
  const missCountRef = useRef(0);

  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const [dartPos, setDartPos] = useState({ x: 0, y: 0 });
  const [dartRotation, setDartRotation] = useState(-45);
  const [isDragging, setIsDragging] = useState(false);
  const [aimVector, setAimVector] = useState(null);
  const [shotActive, setShotActive] = useState(false);
  const [hitTarget, setHitTarget] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [trajectoryPoints, setTrajectoryPoints] = useState([]);

  const posRef = useRef({ x: 0, y: 0 });
  const setDartPosition = useCallback((next) => {
    posRef.current = next;
    setDartPos(next);
  }, []);

  const floorY = useCallback(
    () => Math.max(DART_SIZE + 8, bounds.height - DART_SIZE - 30),
    [bounds.height]
  );

  const resetDart = useCallback(() => {
    if (!bounds.width || !bounds.height) return;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    shotActiveRef.current = false;
    setShotActive(false);
    hitRef.current = false;
    velocityRef.current = { vx: 0, vy: 0 };
    lastTimeRef.current = null;
    flightStartRef.current = null;
    missCountRef.current = 0;
    setAimVector(null);
    setTrajectoryPoints([]);
    setDartRotation(-45);
    setDartPosition({
      x: bounds.width / 2,
      y: floorY(),
    });
  }, [bounds.height, bounds.width, floorY, setDartPosition]);

  const handleHit = useCallback(
    (target) => {
      if (!target || hitRef.current) return;
      hitRef.current = true;
      shotActiveRef.current = false;
      setShotActive(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setHitTarget(target.id);
      setToasts((prev) => [
        ...prev,
        { id: `${target.id}-${Date.now()}`, label: target.label },
      ]);

      const section = document.getElementById(target.id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      setTimeout(() => setHitTarget(null), 1200);
      setTimeout(() => resetDart(), 600);
      setTimeout(
        () => setToasts((prev) => prev.slice(1)),
        1600
      );
    },
    [resetDart]
  );

  const checkTargetCollision = useCallback(
    (x, y) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      targetRefs.current.forEach((node, index) => {
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const centerX = rect.left - containerRect.left + rect.width / 2;
        const centerY = rect.top - containerRect.top + rect.height / 2;
        const distance = Math.hypot(x - centerX, y - centerY);
        if (distance < 40) {
          handleHit(TARGETS[index]);
        }
      });
    },
    [handleHit]
  );

  const step = useCallback(
    (timestamp) => {
      if (!shotActiveRef.current) return;
      
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
        flightStartRef.current = timestamp;
        animationRef.current = requestAnimationFrame(step);
        return;
      }

      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const flightTime = (timestamp - flightStartRef.current) / 1000;
      if (flightTime > MAX_FLIGHT_TIME) {
        shotActiveRef.current = false;
        setShotActive(false);
        resetDart();
        return;
      }

      let nextPosition = { ...posRef.current };
      nextPosition.x += velocityRef.current.vx * delta;
      nextPosition.y += velocityRef.current.vy * delta;
      velocityRef.current.vy += GRAVITY * delta;

      // Update dart rotation based on velocity
      const angle = Math.atan2(velocityRef.current.vy, velocityRef.current.vx);
      setDartRotation((angle * 180) / Math.PI);

      // Wall collision
      if (nextPosition.x < DART_SIZE || nextPosition.x > bounds.width - DART_SIZE) {
        shotActiveRef.current = false;
        setShotActive(false);
        setTimeout(() => resetDart(), 400);
        return;
      }

      // Ceiling collision
      if (nextPosition.y < DART_SIZE) {
        shotActiveRef.current = false;
        setShotActive(false);
        setTimeout(() => resetDart(), 400);
        return;
      }

      // Ground collision
      const ground = floorY();
      if (nextPosition.y >= ground) {
        nextPosition.y = ground;
        shotActiveRef.current = false;
        setShotActive(false);
        setTimeout(() => resetDart(), 400);
        setDartPosition(nextPosition);
        return;
      }

      setDartPosition(nextPosition);
      checkTargetCollision(nextPosition.x, nextPosition.y);

      if (shotActiveRef.current) {
        animationRef.current = requestAnimationFrame(step);
      }
    },
    [bounds.width, checkTargetCollision, floorY, resetDart, setDartPosition]
  );

  const computeTrajectoryPoints = useCallback(
    (vector) => {
      if (!vector) return [];
      const origin = anchorRef.current;
      if (!origin) return [];
      const distance = Math.hypot(vector.x, vector.y);
      if (distance < 8) return [];
      const ratio = Math.min(distance, MAX_PULL) / distance;
      const limitedVector = {
        x: vector.x * ratio,
        y: vector.y * ratio,
      };
      const velocity = {
        vx: -limitedVector.x * POWER_SCALE,
        vy: -limitedVector.y * POWER_SCALE,
      };
      const points = [];
      const steps = 12;
      const stepTime = 0.06;

      for (let i = 1; i <= steps; i++) {
        const t = stepTime * i;
        const x = origin.x + velocity.vx * t;
        const y =
          origin.y + velocity.vy * t + 0.5 * GRAVITY * Math.pow(t, 2);
        if (x < DART_SIZE || x > bounds.width - DART_SIZE) break;
        if (y > floorY() + DART_SIZE) break;
        points.push({
          x,
          y,
          opacity: Math.max(0, 1 - i / (steps + 2)),
        });
      }

      return points;
    },
    [bounds.width, floorY]
  );

  const releaseShot = useCallback(
    (point) => {
      setIsDragging(false);
      setAimVector(null);
      setTrajectoryPoints([]);
      if (!anchorRef.current) return;

      const dragVector = {
        x: point.x - anchorRef.current.x,
        y: point.y - anchorRef.current.y,
      };

      const distance = Math.hypot(dragVector.x, dragVector.y);
      if (distance < 12) return;

      const ratio = Math.min(distance, MAX_PULL) / distance;
      const limitedVector = {
        x: dragVector.x * ratio,
        y: dragVector.y * ratio,
      };

      velocityRef.current = {
        vx: -limitedVector.x * POWER_SCALE,
        vy: -limitedVector.y * POWER_SCALE,
      };

      shotActiveRef.current = true;
      setShotActive(true);
      lastTimeRef.current = null;
      flightStartRef.current = null;
      missCountRef.current = 0;
      animationRef.current = requestAnimationFrame(step);
    },
    [step]
  );

  const handlePointerDown = (event) => {
    if (shotActiveRef.current) return;
    event.preventDefault();
    anchorRef.current = { ...posRef.current };
    setAimVector({ x: 0, y: 0 });
    setTrajectoryPoints([]);
    setIsDragging(true);
  };

  useEffect(() => {
    const updateBounds = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setBounds({ width: rect.width, height: rect.height });
      setDartPosition({
        x: rect.width / 2,
        y: Math.max(DART_SIZE + 8, rect.height - DART_SIZE - 30),
      });
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, [setDartPosition]);

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      const dragVector = {
        x: point.x - anchorRef.current.x,
        y: point.y - anchorRef.current.y,
      };
      setAimVector(dragVector);
      setTrajectoryPoints(computeTrajectoryPoints(dragVector));
    };

    const handlePointerUp = (event) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      releaseShot(point);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [computeTrajectoryPoints, isDragging, releaseShot]);

  useEffect(
    () => () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    },
    []
  );

  const aimDistance = aimVector
    ? Math.min(Math.hypot(aimVector.x, aimVector.y), MAX_PULL)
    : 0;
  const aimAngle = aimVector ? Math.atan2(aimVector.y, aimVector.x) : 0;

  return (
    <div className="game-layer">
      <div className="dart-game" ref={containerRef}>
        <div className="game-targets">
          {TARGETS.map((target, index) => (
            <div
              key={target.id}
              ref={(node) => {
                targetRefs.current[index] = node;
              }}
              className={`target ${hitTarget === target.id ? "hit" : ""}`}
            >
              <div className="target-board" style={{ "--target-color": target.color }}>
                <div className="target-ring ring-outer" />
                <div className="target-ring ring-middle" />
                <div className="target-ring ring-inner" />
                <div className="target-bullseye" />
              </div>
              <span className="target-label">{target.label}</span>
            </div>
          ))}
        </div>

        {isDragging && aimVector && (
          <div
            className="aim-line"
            style={{
              width: `${aimDistance}px`,
              transform: `translate(${anchorRef.current.x}px, ${anchorRef.current.y}px) rotate(${aimAngle}rad)`,
            }}
          />
        )}

        {trajectoryPoints.map((point, index) => (
          <span
            key={`traj-${index}`}
            className="trajectory-dot"
            style={{
              left: `${point.x - 4}px`,
              top: `${point.y - 4}px`,
              opacity: point.opacity,
            }}
          />
        ))}

        {bounds.width > 0 && bounds.height > 0 && (
          <>
            <button
              type="button"
              aria-label="Throw dart"
              className={`dart ${isDragging ? "dragging" : ""} ${
                shotActive ? "in-flight" : ""
              }`}
              onPointerDown={handlePointerDown}
              style={{
                left: `${dartPos.x}px`,
                top: `${dartPos.y}px`,
                transform: `translate(-50%, -50%) rotate(${dartRotation}deg)`,
              }}
            >
              <span className="dart-tip" />
              <span className="dart-body" />
              <span className="dart-flight" />
            </button>
            
            {!shotActive && !isDragging && (
              <div
                className="dart-tag"
                style={{
                  left: `${dartPos.x + 30}px`,
                  top: `${dartPos.y - 20}px`,
                }}
              >
                Use me to aim
              </div>
            )}
          </>
        )}

        <div className="score-stack">
          {toasts.map((toast) => (
            <div key={toast.id} className="score-toast">
              Bullseye! <span>{toast.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

