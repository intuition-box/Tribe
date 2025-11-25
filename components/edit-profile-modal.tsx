"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2 } from "lucide-react"
import { createOrUpdateUserProfile, getUserProfile, type UserProfile } from "@/lib/user-profiles"
import Image from "next/image"

interface EditProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  walletAddress: string
  onProfileUpdated?: () => void
}

export default function EditProfileModal({
  open,
  onOpenChange,
  walletAddress,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [imagePreview, setImagePreview] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open && walletAddress) {
      loadProfile()
    }
  }, [open, walletAddress])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const profile = await getUserProfile(walletAddress)
      if (profile) {
        setDisplayName(profile.display_name || "")
        setProfileImage(profile.profile_image || "")
        setImagePreview(profile.profile_image || "")
      }
    } catch (error) {
      console.error("[v0] Error loading profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setProfileImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!displayName.trim()) {
      alert("Please enter a display name")
      return
    }

    setIsSaving(true)
    try {
      const profileData: UserProfile = {
        wallet_address: walletAddress,
        display_name: displayName.trim(),
        profile_image: profileImage,
      }

      await createOrUpdateUserProfile(profileData)
      onProfileUpdated?.()
      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Error saving profile:", error)
      alert("Failed to save profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Profile Image */}
            <div className="space-y-2">
              <Label>Profile Image</Label>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full border-2 border-border overflow-hidden bg-muted">
                  {imagePreview ? (
                    <Image src={imagePreview || "/placeholder.svg"} alt="Profile" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Upload className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="profile-image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("profile-image")?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                maxLength={50}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
