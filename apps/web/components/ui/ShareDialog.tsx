"use client";
import { useState } from "react";
import {
    Check,
    Copy,
    Link,
    Share2,
    MessageCircle,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";
interface ShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    url?: string;
}
export default function ShareDialog({
    open,
    onOpenChange,
    title,
    url,
}: ShareDialogProps) {
    const [copied, setCopied] = useState(false);
    const shareUrl =
        url || (typeof window !== "undefined" ? window.location.href : "");
    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.add({
                title: "Link copied",
                description: "Notebook link copied successfully.",
                type: "success",
            });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.add({
                title: "Copy failed",
                description: "Unable to copy the notebook link.",
                type: "error",
            });
        }
    };
    const shareNative = async () => {
        if (!navigator.share) {
            await copyLink();
            return;
        }
        try {
            await navigator.share({
                title,
                text: `Check out this notebook: ${title}`,
                url: shareUrl,
            });
        } catch (error) {
            if (error instanceof Error && error.name !== "AbortError") {
                toast.add({
                    title: "Sharing failed",
                    description: "Unable to share this notebook.",
                    type: "error",
                });
            }
        }
    };
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const socialLinks = [
        {
            name: "WhatsApp",
            icon: FaWhatsapp,
            className: "text-green-500",
            url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        },
        {
            name: "Facebook",
            icon: FaFacebook,
            className: "text-blue-500",
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        },
        {
            name: "X",
            icon: FaTwitter,
            className: "text-foreground",
            url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        },
    ];
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 size={20} />
                        Share notebook
                    </DialogTitle>
                    <DialogDescription>
                        Share your notebook with others using the link below.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-2">
                    {/* Copy Link */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Link size={16} />
                            Notebook link
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                value={shareUrl}
                                readOnly
                                className="min-w-0"
                            />
                            <Button
                                onClick={copyLink}
                                size="icon"
                                variant="outline"
                                className="shrink-0"
                            >
                                {copied ? (
                                    <Check size={17} />
                                ) : (
                                    <Copy size={17} />
                                )}
                            </Button>
                        </div>
                    </div>
                    {/* Native Share */}
                    <Button onClick={shareNative} className="w-full">
                        <Share2 size={17} />
                        Share link
                    </Button>
                    {/* Social Sharing */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium">
                            Share on social media
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.name}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-accent"
                                    >
                                        <Icon
                                            size={22}
                                            className={social.className}
                                        />
                                        <span className="text-xs font-medium">
                                            {social.name}
                                        </span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
