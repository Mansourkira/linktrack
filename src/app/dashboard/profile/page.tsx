"use client"

import { useState, useEffect } from "react"
import { IconUser, IconCamera, IconDeviceFloppy, IconUpload, IconX } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"

interface Profile {
    id: string
    username: string | null
    email: string | null
    fullName: string | null
    avatarUrl: string | null
    website: string | null
    themeMode: string | null
    createdAt: string
    updatedAt: string
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        website: "",
        themeMode: "system"
    })
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            setIsLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                toast.error("You must be logged in to view your profile")
                return
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw error
            }

            if (data) {
                setProfile(data)
                setFormData({
                    username: data.username || "",
                    fullName: data.fullName || "",
                    website: data.website || "",
                    themeMode: data.themeMode || "system"
                })
                setAvatarPreview(data.avatarUrl)
            } else {
                // Create profile if it doesn't exist
                await createProfile(user.id, user.email || "")
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            toast.error('Failed to fetch profile')
        } finally {
            setIsLoading(false)
        }
    }

    const createProfile = async (userId: string, email: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    email: email,
                    username: null,
                    fullName: null,
                    avatarUrl: null,
                    website: null,
                    themeMode: 'system'
                })
                .select()
                .single()

            if (error) throw error

            setProfile(data)
            setFormData({
                username: "",
                fullName: "",
                website: "",
                themeMode: "system"
            })
        } catch (error) {
            console.error('Error creating profile:', error)
            toast.error('Failed to create profile')
        }
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file')
                return
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB')
                return
            }

            setAvatarFile(file)

            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const uploadAvatar = async (): Promise<string | null> => {
        if (!avatarFile || !profile) return null

        try {
            setIsUploading(true)

            // Generate unique filename
            const fileExt = avatarFile.name.split('.').pop()
            const fileName = `${profile.id}-${Date.now()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            return publicUrl
        } catch (error) {
            console.error('Error uploading avatar:', error)
            toast.error('Failed to upload avatar')
            return null
        } finally {
            setIsUploading(false)
        }
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)

            if (!profile) {
                toast.error("Profile not found")
                return
            }

            // Upload avatar first if there's a new one
            let avatarUrl = profile.avatarUrl
            if (avatarFile) {
                const uploadedUrl = await uploadAvatar()
                if (uploadedUrl) {
                    avatarUrl = uploadedUrl
                }
            }

            // Update profile
            const { error } = await supabase
                .from('profiles')
                .update({
                    username: formData.username || null,
                    fullName: formData.fullName || null,
                    website: formData.website || null,
                    themeMode: formData.themeMode,
                    avatarUrl: avatarUrl,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', profile.id)

            if (error) throw error

            // Update local state
            setProfile(prev => prev ? {
                ...prev,
                username: formData.username || null,
                fullName: formData.fullName || null,
                website: formData.website || null,
                themeMode: formData.themeMode,
                avatarUrl: avatarUrl
            } : null)

            // Clear avatar file
            setAvatarFile(null)

            toast.success('Profile updated successfully!')
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    const removeAvatar = async () => {
        try {
            if (!profile?.avatarUrl) return

            // Remove from storage if it's a custom upload
            if (profile.avatarUrl.includes('avatars/')) {
                const filePath = profile.avatarUrl.split('/').pop()
                if (filePath) {
                    await supabase.storage
                        .from('avatars')
                        .remove([`avatars/${filePath}`])
                }
            }

            // Update profile
            const { error } = await supabase
                .from('profiles')
                .update({
                    avatarUrl: null,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', profile.id)

            if (error) throw error

            setProfile(prev => prev ? { ...prev, avatarUrl: null } : null)
            setAvatarPreview(null)
            setAvatarFile(null)

            toast.success('Avatar removed successfully!')
        } catch (error) {
            console.error('Error removing avatar:', error)
            toast.error('Failed to remove avatar')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-lg">Loading profile...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6 w-full">
            {/* Header */}
            <div className="flex items-center gap-3">
                <IconUser className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">Profile Settings</h1>
                    <p className="text-muted-foreground">Manage your account information and preferences</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                            Update your personal information and account details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Avatar Section */}
                        <div className="space-y-3">
                            <Label>Profile Picture</Label>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={avatarPreview || undefined} />
                                        <AvatarFallback className="text-lg">
                                            {profile?.fullName?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                                        onClick={() => document.getElementById('avatar-input')?.click()}
                                    >
                                        <IconCamera className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <input
                                        id="avatar-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById('avatar-input')?.click()}
                                        disabled={isUploading}
                                    >
                                        <IconUpload className="mr-2 h-4 w-4" />
                                        {isUploading ? 'Uploading...' : 'Change Avatar'}
                                    </Button>
                                    {avatarPreview && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={removeAvatar}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <IconX className="mr-2 h-4 w-4" />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                placeholder="Enter username"
                                value={formData.username}
                                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                            />
                            <p className="text-xs text-muted-foreground">
                                Username must be unique and can contain letters, numbers, and underscores
                            </p>
                        </div>

                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            />
                        </div>

                        {/* Website */}
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                type="url"
                                placeholder="https://yourwebsite.com"
                                value={formData.website}
                                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                            />
                        </div>

                        {/* Theme Mode */}
                        <div className="space-y-2">
                            <Label htmlFor="themeMode">Theme Mode</Label>
                            <Select
                                value={formData.themeMode}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, themeMode: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select theme mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>
                            Your account details and preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input
                                value={profile?.email || ''}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                Email address cannot be changed from this page
                            </p>
                        </div>

                        {/* Member Since */}
                        <div className="space-y-2">
                            <Label>Member Since</Label>
                            <Input
                                value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ''}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        {/* Last Updated */}
                        <div className="space-y-2">
                            <Label>Last Updated</Label>
                            <Input
                                value={profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : ''}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        {/* Save Button */}
                        <div className="pt-4">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || isUploading}
                                className="w-full"
                            >
                                <IconDeviceFloppy className="mr-2 h-4 w-4" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
