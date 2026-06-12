import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { GlassPanel } from "./common/GlassPanel";
import { Lock, Delete, ShieldAlert } from "lucide-react";
import styles from "./PinLockScreen.module.css";

export function PinLockScreen() {
  const settings = useStore((s) => s.settings);
  const incorrectAttempts = useStore((s) => s.incorrectAttempts);
  const setCredentials = useStore((s) => s.setCredentials);
  const unlock = useStore((s) => s.unlock);
  const clearAllAppData = useStore((s) => s.clearAllAppData);

  const isSetupMode = !settings.pinHash;

  const [username, setUsername] = useState("");
  const [pin, setPinInput] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"username" | "enter" | "confirm">(
    isSetupMode ? "username" : "enter"
  );
  const [error, setError] = useState("");

  // Clear input/errors on mode changes
  useEffect(() => {
    setPinInput("");
    setConfirmPin("");
    setUsername("");
    setStep(isSetupMode ? "username" : "enter");
    setError("");
  }, [isSetupMode]);

  const handleKeyPress = (num: string) => {
    setError("");
    if (step === "username") return;
    if (step === "enter") {
      if (pin.length < 8) {
        setPinInput((prev) => prev + num);
      }
    } else {
      if (confirmPin.length < 8) {
        setConfirmPin((prev) => prev + num);
      }
    }
  };

  const handleBackspace = () => {
    setError("");
    if (step === "username") return;
    if (step === "enter") {
      setPinInput((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    setError("");
    if (step === "username") return;
    if (step === "enter") {
      setPinInput("");
    } else {
      setConfirmPin("");
    }
  };

  const handleAction = async () => {
    setError("");
    if (isSetupMode) {
      if (step === "username") {
        if (username.trim().length < 3) {
          setError("Username must be at least 3 characters.");
          return;
        }
        setStep("enter");
      } else if (step === "enter") {
        if (pin.length < 6 || pin.length > 8) {
          setError("PIN must be between 6 and 8 digits.");
          return;
        }
        setStep("confirm");
      } else {
        if (pin !== confirmPin) {
          setError("PIN codes do not match. Please try again.");
          setConfirmPin("");
          setStep("enter");
          setPinInput("");
          return;
        }
        await setCredentials(username, pin);
      }
    } else {
      if (username.trim().length === 0) {
        setError("Please enter your Username.");
        return;
      }
      if (pin.length < 6 || pin.length > 8) {
        setError("PIN must be between 6 and 8 digits.");
        return;
      }
      const success = await unlock(username, pin);
      if (!success) {
        setError("Incorrect Username or PIN.");
        setPinInput("");
      }
    }
  };

  const handleUsernameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAction();
    }
  };

  const handleWipeData = async () => {
    const confirmed = window.confirm(
      "WARNING: This will permanently delete all your request history, environment variables, and saved collections. This action cannot be undone. Are you sure you want to reset?"
    );
    if (confirmed) {
      await clearAllAppData();
      alert("Application data wiped successfully. Please set a new Username and PIN.");
    }
  };

  const activeValue = step === "enter" ? pin : confirmPin;
  const currentPinLength = activeValue.length;

  const isButtonEnabled =
    isSetupMode && step === "username"
      ? username.trim().length >= 3
      : currentPinLength >= 6 && username.trim().length > 0;

  let titleText = "Enter PIN to Unlock";
  if (isSetupMode) {
    if (step === "username") titleText = "Set Username";
    else if (step === "enter") titleText = "Set PIN Code";
    else titleText = "Confirm PIN Code";
  }

  let subtitleText = "Please enter your security details to access your workspace.";
  if (isSetupMode) {
    if (step === "username") {
      subtitleText = "Enter a username for your Sawatdee API workspace.";
    } else if (step === "enter") {
      subtitleText = "Set a 6-8 digit PIN code to secure your Sawatdee API data.";
    } else {
      subtitleText = "Re-enter the PIN code to verify and save.";
    }
  } else {
    subtitleText = "Please enter your Username and PIN to unlock your workspace.";
  }

  return (
    <div className={styles.container}>
      <GlassPanel strong className={styles.panel}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <Lock size={40} className={styles.logoIcon} style={{ color: "var(--pg-pink-500)" }} />
        </div>

        <h1 className={styles.title}>{titleText}</h1>

        <p className={styles.subtitle}>{subtitleText}</p>

        {/* Username input field (shows during username step or unlock mode) */}
        {(step === "username" || !isSetupMode) && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleUsernameKeyDown}
              placeholder="Username"
              className={styles.usernameInput}
              autoFocus={step === "username"}
            />
          </div>
        )}

        {/* Display read-only Username in Setup PIN steps */}
        {isSetupMode && step !== "username" && (
          <div style={{ marginBottom: "16px", fontSize: "14px", color: "var(--pg-text-strong)" }}>
            Username: <strong>{username}</strong>
          </div>
        )}

        {/* Indicator dots for PIN entry (only during PIN steps or unlock mode) */}
        {step !== "username" && (
          <div className={styles.dots}>
            {Array.from({ length: 8 }).map((_, idx) => {
              const isActive = idx < currentPinLength;
              return (
                <div
                  key={idx}
                  className={`${styles.dot} ${isActive ? styles.dotActive : ""}`}
                />
              );
            })}
          </div>
        )}

        {error && <div className={styles.errorText}>{error}</div>}

        {incorrectAttempts > 0 && !isSetupMode && (
          <div className={styles.errorText} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <ShieldAlert size={16} />
            <span>
              Incorrect credentials. Attempt {incorrectAttempts} of 5.
            </span>
          </div>
        )}

        {/* Numpad layout (only during PIN steps or unlock mode) */}
        {step !== "username" && (
          <div className={styles.numpad}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                className={styles.numBtn}
                onClick={() => handleKeyPress(num)}
              >
                {num}
              </button>
            ))}
            <button type="button" className={styles.numBtn} onClick={handleClear} style={{ fontSize: "14px" }}>
              Clear
            </button>
            <button type="button" className={styles.numBtn} onClick={() => handleKeyPress("0")}>
              0
            </button>
            <button type="button" className={styles.numBtn} onClick={handleBackspace} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Delete size={20} />
            </button>
          </div>
        )}

        {/* Action button row */}
        <div className={styles.actionRow}>
          <button
            type="button"
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "12px",
              background: "linear-gradient(135deg, var(--pg-pink-500), var(--pg-pink-600))",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: isButtonEnabled ? "pointer" : "not-allowed",
              opacity: isButtonEnabled ? 1 : 0.6,
            }}
            disabled={!isButtonEnabled}
            onClick={handleAction}
          >
            {isSetupMode ? (step === "username" || step === "enter" ? "Next" : "Save & Lock") : "Unlock"}
          </button>

          {isSetupMode && step === "enter" && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                width: "100%",
                padding: "8px",
                background: "transparent",
                color: "var(--pg-text-strong)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => {
                setStep("username");
                setPinInput("");
                setError("");
              }}
            >
              Back
            </button>
          )}

          {isSetupMode && step === "confirm" && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                width: "100%",
                padding: "8px",
                background: "transparent",
                color: "var(--pg-text-strong)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => {
                setStep("enter");
                setConfirmPin("");
                setError("");
              }}
            >
              Back
            </button>
          )}

          {!isSetupMode && (
            <button type="button" className={styles.resetBtn} onClick={handleWipeData}>
              Forgot details? (Click to wipe all local data and reset)
            </button>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
