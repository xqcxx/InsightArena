"use client";

import { useState } from "react";
import { X, Check, AlertCircle } from "lucide-react";

type ModalStep = "idle" | "connecting" | "signing" | "success" | "error";

interface WalletOption {
  id: "freighter" | "xbull" | "albedo";
  name: string;
  isAvailable: boolean;
}

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (address: string, token: string) => void;
}

const WALLET_OPTIONS: WalletOption[] = [
  { id: "freighter", name: "Freighter", isAvailable: true },
  { id: "xbull", name: "XBull", isAvailable: false },
  { id: "albedo", name: "Albedo", isAvailable: false },
];

export default function ConnectWalletModal({
  isOpen,
  onClose,
  onSuccess,
}: ConnectWalletModalProps) {
  const [step, setStep] = useState<ModalStep>("idle");
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [challengeString, setChallengeString] = useState("");
  const [error, setError] = useState("");
  const [connectedAddress, setConnectedAddress] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(false);

  const resetModal = () => {
    setStep("idle");
    setSelectedWallet(null);
    setChallengeString("");
    setError("");
    setConnectedAddress("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleWalletSelect = async (walletId: string) => {
    if (walletId !== "freighter") return;

    setSelectedWallet(walletId);
    setStep("connecting");

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      setChallengeString(
        "Sign this message to verify wallet ownership: arena_challenge_" +
          Date.now()
      );
      setStep("signing");
    } catch (err) {
      setError("Failed to connect to Freighter. Make sure it's installed.");
      setStep("error");
    }
  };

  const handleSign = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockAddress = "0x" + Math.random().toString(16).substring(2, 42);
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

      setConnectedAddress(mockAddress);
      setStep("success");

      setTimeout(() => {
        onSuccess(mockAddress, mockToken);
        handleClose();
      }, 1500);
    } catch (err) {
      setError("Signing was rejected. Please try again.");
      setStep("error");
    }
  };

  const handleRetry = () => {
    setError("");
    setStep("idle");
    setSelectedWallet(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-[480px] mx-4 rounded-2xl border border-white/10 bg-[#111726] p-8">
        {step !== "success" && (
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="absolute top-6 right-6 inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {step === "idle" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Connect Your Wallet
              </h2>
              <p className="mt-2 text-sm text-[#9aa4bc]">
                Connect your Stellar wallet to start predicting
              </p>
            </div>

            <div className="space-y-3">
              {WALLET_OPTIONS.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => wallet.isAvailable && handleWalletSelect(wallet.id)}
                  disabled={!wallet.isAvailable}
                  className={`w-full rounded-xl border px-4 py-4 text-left transition ${
                    wallet.isAvailable
                      ? "border-white/10 bg-[#0f172a] hover:border-[#4FD1C5]/40 hover:bg-[#0f172a]"
                      : "border-white/5 bg-[#0a0f1a] cursor-not-allowed opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{wallet.name}</span>
                    {!wallet.isAvailable && (
                      <span className="rounded-full bg-[#4FD1C5]/10 px-2 py-1 text-xs font-medium text-[#4FD1C5]">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setExpandedFaq(!expandedFaq)}
                className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-left text-sm font-medium text-white hover:border-[#4FD1C5]/40 transition"
              >
                What is a Stellar wallet?
              </button>
              {expandedFaq && (
                <div className="rounded-xl border border-white/10 bg-[#0a0f1a] px-4 py-3 text-sm text-[#9aa4bc]">
                  A Stellar wallet is a secure digital wallet that stores your
                  Stellar account keys. It allows you to manage assets and sign
                  transactions on the Stellar blockchain.
                </div>
              )}
            </div>
          </div>
        )}

        {step === "connecting" && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#4FD1C5]/20 border-t-[#4FD1C5]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Connecting to Freighter...
              </h3>
              <p className="mt-2 text-sm text-[#9aa4bc]">
                Please approve the connection in your Freighter extension
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm font-medium text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
          </div>
        )}

        {step === "signing" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#4FD1C5]/20 border-t-[#4FD1C5]" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Sign to verify ownership
              </h3>
              <p className="mt-2 text-sm text-[#9aa4bc]">
                Please sign the message in your Freighter extension
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0a0f1a] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#6f7891]">
                Challenge
              </p>
              <code className="block break-words text-xs text-[#4FD1C5] font-mono">
                {challengeString.substring(0, 60)}...
              </code>
            </div>

            <div className="rounded-xl border border-[#A78BFA]/20 bg-[#A78BFA]/5 p-4">
              <p className="text-xs text-[#c9b4ff]">
                <span className="font-semibold">Security note:</span> We never
                ask for your private key. Signing is free.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm font-medium text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <Check className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Wallet Connected!
              </h3>
              <p className="mt-2 text-sm text-[#4FD1C5] font-mono">
                {connectedAddress.substring(0, 6)}...
                {connectedAddress.substring(connectedAddress.length - 4)}
              </p>
              <p className="mt-4 text-xs text-[#9aa4bc]">
                Redirecting to dashboard...
              </p>
            </div>
          </div>
        )}

        {step === "error" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white">
                Connection Failed
              </h3>
              <p className="mt-2 text-sm text-[#9aa4bc]">{error}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 rounded-xl bg-[#4FD1C5]/10 border border-[#4FD1C5]/40 px-4 py-3 text-sm font-medium text-[#4FD1C5] hover:bg-[#4FD1C5]/20 transition"
              >
                Try Again
              </button>
              <a
                href="https://freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-center text-sm font-medium text-white hover:bg-white/5 transition"
              >
                Install Freighter
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
