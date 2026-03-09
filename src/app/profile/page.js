"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/db/supabase";
import { useAuth } from "@/app/auth/auth-context";
import toast from "react-hot-toast";
import { HiOutlineUser, HiOutlinePhone, HiOutlineMail } from "react-icons/hi";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    // If auth finishes loading and there's no user, redirect to login
    if (!authLoading && !user) {
      router.push("/auth/login");
    }

    if (user) {
      setName(user.user_metadata?.full_name || "");
      setPhone(user.user_metadata?.phone || "");
      setAvatarUrl(user.user_metadata?.avatar_url || "");
    }
  }, [user, authLoading, router]);

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: name,
        phone: phone,
        avatar_url: avatarUrl,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated successfully!");
    }
    setLoading(false);
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload image to the "avatars" bucket
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL of the uploaded image
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setAvatarUrl(data.publicUrl);
      toast.success("Picture uploaded! Save your profile to finalize.");

    } catch (error) {
      toast.error(error.message || "Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-gold border-t-transparent pt-20" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8 rounded-2xl border border-border-color bg-bg-card p-6 sm:p-10 shadow-xl">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-accent-gold">
            Profile Settings
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Manage your personal information and preferences
          </p>
        </div>

        <form className="mt-8 space-y-8" onSubmit={updateProfile}>
          
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-accent-gold bg-bg-elevated shadow-md">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-bg-primary text-text-muted">
                  <HiOutlineUser size={48} />
                </div>
              )}
            </div>
            <div>
              <label 
                htmlFor="avatar-upload" 
                className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all border border-accent-gold/50 text-accent-gold hover:bg-accent-gold hover:text-bg-primary ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {uploading ? "Uploading..." : "Change Picture"}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
                className="hidden"
              />
            </div>
            <p className="text-xs text-text-muted text-center max-w-[250px]">
              Requires an "avatars" bucket inside your Supabase Storage.
            </p>
          </div>

          <div className="space-y-5 rounded-md">
            
            {/* Email (Read Only) */}
            <div>
               <label className="text-sm font-medium text-text-secondary">Email Address</label>
               <div className="mt-1 flex items-center gap-3 input-field bg-bg-elevated/30 opacity-70">
                 <HiOutlineMail className="text-text-muted" size={20} />
                 <input
                   type="email"
                   disabled
                   className="w-full bg-transparent outline-none text-text-muted"
                   value={user.email}
                 />
               </div>
            </div>

            {/* Full Name */}
            <div>
               <label className="text-sm font-medium text-text-secondary">Full Name</label>
               <div className="mt-1 flex items-center gap-3 input-field focus-within:ring-1 focus-within:ring-accent-gold">
                 <HiOutlineUser className="text-accent-gold" size={20} />
                 <input
                   type="text"
                   required
                   className="w-full bg-transparent outline-none text-text-primary placeholder:text-text-muted"
                   placeholder="Your full name"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                 />
               </div>
            </div>

            {/* Phone Number */}
            <div>
               <label className="text-sm font-medium text-text-secondary">Phone Number</label>
               <div className="mt-1 flex items-center gap-3 input-field focus-within:ring-1 focus-within:ring-accent-gold">
                 <HiOutlinePhone className="text-accent-gold" size={20} />
                 <input
                   type="tel"
                   className="w-full bg-transparent outline-none text-text-primary placeholder:text-text-muted"
                   placeholder="+92 3XX XXXXXXX"
                   value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                 />
               </div>
            </div>

          </div>

          <div className="flex gap-4 pt-4 border-t border-border-color">
            <button
              type="submit"
              disabled={loading || uploading}
              className="btn-primary flex-1 justify-center disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => signOut()}
              className="btn-secondary flex-none rounded-lg text-text-secondary hover:text-red-500"
            >
              Sign Out
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
