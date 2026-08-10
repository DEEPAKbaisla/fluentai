"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/avatar";
import { SettingsSkeleton } from "@/components/dashboard-skeletons";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const accents = [
  { code: "en-US", label: "American", flag: "🇺🇸", description: "US English accent" },
  { code: "en-GB", label: "British", flag: "🇬🇧", description: "UK English accent" },
  { code: "en-AU", label: "Australian", flag: "🇦🇺", description: "Australian English accent" },
  { code: "en-IN", label: "Indian", flag: "🇮🇳", description: "Indian English accent" },
];

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedAccent, setSelectedAccent] = useState("en-US");
  const [accentSaving, setAccentSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: true,
    streak: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/profile")
        .then((r) => r.json())
        .then((data) => {
          setName(data.name || "");
          setEmail(data.email || "");
          setImagePreview(data.image || null);
        }),
      fetch("/api/user/settings")
        .then((r) => r.json())
        .then((data) => {
          if (data.accent) setSelectedAccent(data.accent);
        }),
    ]).finally(() => setLoading(false));
  }, []);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    let imageUrl: string | undefined;

    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        toast.error("Failed to upload image");
        setSaving(false);
        return;
      }
      const { url } = await uploadRes.json();
      imageUrl = url;
    }

    const body: { name: string; image?: string } = { name };
    if (imageUrl) {
      body.image = imageUrl;
    }

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      await updateSession();
      setImageFile(null);
      toast.success("Profile updated!");
    } else {
      toast.error("Failed to update profile");
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleAccentChange(code: string) {
    setSelectedAccent(code);
    setAccentSaving(true);
    await fetch("/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accent: code }),
    });
    setAccentSaving(false);
  }

  const userInitials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const userImage = session?.user?.image || null;

  if (loading) {
    return <SettingsSkeleton />;
  }

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
          <Avatar src={imagePreview || undefined} fallback={userInitials} size="xl" />
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleImageSelect}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
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

      {/* AI Accent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-border/50 bg-card p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">AI Accent</h2>
            <p className="text-sm text-muted-foreground">Choose how your AI coach sounds</p>
          </div>
          {accentSaving && (
            <span className="text-xs text-muted-foreground">Saving...</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {accents.map((accent) => (
            <button
              key={accent.code}
              onClick={() => handleAccentChange(accent.code)}
              disabled={accentSaving}
              className={`rounded-xl border p-4 text-left transition-all ${
                selectedAccent === accent.code
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border/50 hover:border-border hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{accent.flag}</span>
                <div>
                  <p className={`font-medium ${selectedAccent === accent.code ? "text-primary" : ""}`}>
                    {accent.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{accent.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
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
        transition={{ duration: 0.4, delay: 0.4 }}
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
