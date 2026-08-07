"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/avatar";
import { useSession } from "next-auth/react";

const voices = [
  { id: "sarah", name: "Sarah", accent: "American" },
  { id: "james", name: "James", accent: "British" },
  { id: "emma", name: "Emma", accent: "Australian" },
  { id: "lucas", name: "Lucas", accent: "Canadian" },
];

const accents = [
  "American",
  "British",
  "Australian",
  "Canadian",
  "Indian",
  "South African",
];

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("sarah");
  const [selectedAccent, setSelectedAccent] = useState("American");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: true,
    streak: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        setName(data.name || "");
        setEmail(data.email || "");
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await updateSession();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const userInitials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const userImage = session?.user?.image || null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account and preferences
        </p>
      </motion.div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl border border-border/50 bg-card p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">Profile</h2>
        <div className="flex items-center gap-4">
          <Avatar src={userImage || undefined} fallback={userInitials} size="xl" />
          <div>
            <Button variant="outline" size="sm">
              Change Photo
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              JPG, GIF or PNG. Max size 2MB.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="opacity-60"
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </motion.div>

      {/* Voice Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-border/50 bg-card p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">Voice Selection</h2>
        <div className="grid grid-cols-2 gap-3">
          {voices.map((voice) => (
            <button
              key={voice.id}
              onClick={() => setSelectedVoice(voice.id)}
              className={`rounded-xl border p-4 text-left transition-all ${
                selectedVoice === voice.id
                  ? "border-primary bg-primary/10"
                  : "border-border/50 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">{voice.name}</p>
                  <p className="text-xs text-muted-foreground">{voice.accent}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Accent Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl border border-border/50 bg-card p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">Target Accent</h2>
        <div className="grid grid-cols-3 gap-2">
          {accents.map((accent) => (
            <button
              key={accent}
              onClick={() => setSelectedAccent(accent)}
              className={`rounded-lg border p-3 text-sm transition-all ${
                selectedAccent === accent
                  ? "border-primary bg-primary/10 font-medium"
                  : "border-border/50 text-muted-foreground hover:border-border"
              }`}
            >
              {accent}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-2xl border border-border/50 bg-card p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">Notifications</h2>
        <div className="space-y-4">
          {[
            { key: "email", label: "Email notifications", desc: "Receive updates via email" },
            { key: "push", label: "Push notifications", desc: "Get notified in your browser" },
            { key: "weekly", label: "Weekly reports", desc: "Get a weekly progress summary" },
            { key: "streak", label: "Streak reminders", desc: "Don't break your streak" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={notifications[item.key as keyof typeof notifications]}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                }
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6"
      >
        <h2 className="mb-4 text-lg font-semibold text-destructive">Danger Zone</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete all conversations</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete all your conversation history
              </p>
            </div>
            <Button variant="destructive" size="sm">Delete</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive" size="sm">Delete Account</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
