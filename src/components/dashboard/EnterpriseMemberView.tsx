import React, { useState } from "react";
import {
  Home,
  MessageSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  Sparkles,
  HelpCircle,
  Clock,
  Zap,
  Lock,
  Download,
  Users,
  Send,
  AlertCircle,
  Radio,
  Share2,
  Bell,
  Link2,
  MapPin,
  User,
  MoreHorizontal,
  Pin,
  Heart,
  MessageCircle,
  Star,
  Calendar,
  ThumbsUp,
  FileText,
  SlidersHorizontal,
  Menu,
  X,
  Bookmark,
  Search,
  RefreshCw,
  Compass,
  Plus,
  ShoppingBag,
  Package,
  Camera,
} from "lucide-react";
import { EnterpriseSubscription, TelegramChannelItem, DiscordChannelItem } from "../../types";
import { TelegramIcon, DiscordIcon } from "./ConnectedAppsView";
import { OfferCheckoutModal, CreatorPlatformOffer } from "./OfferCheckoutModal";
import { PLATFORM_CREATOR_OFFERS } from "./DiscoverCreatorsView";
import { saveSubscription, updateSubscriptionBranding } from "../../utils/subscriptionsStorage";
import { updateCompanyBranding } from "../../utils/companyStorage";
import { EnterpriseBrandingModal } from "./EnterpriseBrandingModal";
import logoImg from "../../assets/images/afhub_logo_africa_1787956612844.jpg";

interface EnterpriseMemberViewProps {
  subscription: EnterpriseSubscription;
  lang: "fr" | "en";
  onBackToPersonal?: () => void;
  allSubscriptions?: EnterpriseSubscription[];
  onSelectSubscription?: (subId: string) => void;
  creatorCompanies?: any[];
  onSelectCreatorCompany?: (comp: any) => void;
  user?: { name: string; email: string; avatarInitials?: string };
  onOpenMarketplace?: () => void;
  onSeedSimulationData?: () => void;
}

export const EnterpriseMemberView: React.FC<EnterpriseMemberViewProps> = ({
  subscription,
  lang,
  onBackToPersonal,
  allSubscriptions = [],
  onSelectSubscription,
  creatorCompanies = [],
  onSelectCreatorCompany,
  user = { name: "Johan Désiré", email: "johan@afhub.app", avatarInitials: "JD" },
  onOpenMarketplace,
  onSeedSimulationData,
}) => {
  // Navigation inside the enterprise hub - defaults to "accueil" for company home view
  const [activeTab, setActiveTab] = useState<"accueil" | "support" | "telegram" | "discord">("accueil");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Dynamic access state based on user's active apps & subscriptions
  const [currentIncludedApps, setCurrentIncludedApps] = useState<string[]>(
    subscription.includedApps || ["dashboard", "support"]
  );

  const isInitiallyPaid = subscription.hasPaidOffer !== undefined
    ? Boolean(subscription.hasPaidOffer)
    : (subscription.includedApps || []).some((a) =>
        ["telegram", "discord", "cours", "vip"].some((kw) => a.toLowerCase().includes(kw))
      );

  const [hasPaidOffer, setHasPaidOffer] = useState<boolean>(isInitiallyPaid);
  const [unlockedProductIds, setUnlockedProductIds] = useState<string[]>(
    subscription.unlockedProductIds || []
  );

  React.useEffect(() => {
    setCurrentIncludedApps(subscription.includedApps || ["dashboard", "support"]);
    const isPaid = subscription.hasPaidOffer !== undefined
      ? Boolean(subscription.hasPaidOffer)
      : (subscription.includedApps || []).some((a) =>
          ["telegram", "discord", "cours", "vip"].some((kw) => a.toLowerCase().includes(kw))
        );
    setHasPaidOffer(isPaid);
    setUnlockedProductIds(subscription.unlockedProductIds || []);
  }, [subscription.id, subscription.includedApps, subscription.hasPaidOffer, subscription.unlockedProductIds]);

  const [checkoutModalOffer, setCheckoutModalOffer] = useState<CreatorPlatformOffer | null>(null);

  // Check if member has unlocked Telegram or Discord VIP access
  const hasTelegramAccess = currentIncludedApps.some(
    (a) => a.toLowerCase().includes("telegram") || a.toLowerCase().includes("signaux")
  );

  const hasDiscordAccess = currentIncludedApps.some(
    (a) => a.toLowerCase().includes("discord")
  );
  
  // Company internal tabs: "Accueil" (default & active with blue underline indicator), "Produits", "Avis"
  const [companyTab, setCompanyTab] = useState<"accueil" | "produits" | "avis">("accueil");

  // Enterprise branding state (Banner & Profile Photo customization)
  const [currentSub, setCurrentSub] = useState<EnterpriseSubscription>(subscription);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);

  React.useEffect(() => {
    setCurrentSub(subscription);
  }, [subscription]);

  // Listen to external branding updates
  React.useEffect(() => {
    const handleBrandingChange = (e: any) => {
      const detail = e.detail;
      if (detail && (detail.companyId === currentSub.companyId || detail.id === currentSub.companyId)) {
        setCurrentSub((prev) => ({
          ...prev,
          companyName: detail.companyName || detail.name || prev.companyName,
          companyBanner: detail.companyBanner || prev.companyBanner,
          companyLogo: detail.companyLogo || prev.companyLogo,
        }));
      }
    };
    window.addEventListener("mansa_subscription_updated", handleBrandingChange);
    window.addEventListener("mansa_company_branding_changed", handleBrandingChange);
    return () => {
      window.removeEventListener("mansa_subscription_updated", handleBrandingChange);
      window.removeEventListener("mansa_company_branding_changed", handleBrandingChange);
    };
  }, [currentSub.companyId]);

  const handleSaveBranding = (branding: {
    name: string;
    description: string;
    companyBanner: string;
    companyLogo: string;
  }) => {
    const userKey = user?.email || "default";
    updateSubscriptionBranding(userKey, currentSub.companyId, {
      companyName: branding.name,
      companyBanner: branding.companyBanner,
      companyLogo: branding.companyLogo,
    });
    updateCompanyBranding(userKey, currentSub.companyId, {
      name: branding.name,
      description: branding.description,
      companyBanner: branding.companyBanner,
      companyLogo: branding.companyLogo,
    });
    setCurrentSub((prev) => ({
      ...prev,
      companyName: branding.name,
      companyBanner: branding.companyBanner,
      companyLogo: branding.companyLogo,
    }));
  };

  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Post likes and interaction states for newsfeed
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({
    "post-pinned": false,
    "post-2": false,
    "post-3": false,
  });
  const [likesCounts, setLikesCounts] = useState<Record<string, number>>({
    "post-pinned": 64,
    "post-2": 42,
    "post-3": 38,
  });
  const [copiedProfileShare, setCopiedProfileShare] = useState(false);
  const [isNotifSubscribed, setIsNotifSubscribed] = useState(true);
  const [optionsDropdownOpen, setOptionsDropdownOpen] = useState(false);
  
  // Telegram multi-step access architecture
  // Step 1: Channels list with Top Header & Central Content Card
  // Step 2: Claim access & QR Code
  // Step 3: Verified Gateway & Join channel
  const [telegramFlowStep, setTelegramFlowStep] = useState<"channels_list" | "claim_qr" | "telegram_gateway">("channels_list");
  
  // Discord multi-step access architecture
  const [discordFlowStep, setDiscordFlowStep] = useState<"channels_list" | "claim_qr" | "discord_gateway">("channels_list");

  // Default channels if empty to ensure visual richness
  const channelsList: TelegramChannelItem[] = (subscription.telegramChannels && subscription.telegramChannels.length > 0)
    ? subscription.telegramChannels
    : [
        {
          id: "tg-vip",
          name: `${subscription.companyName} · VIP Signals & Analysis`,
          tag: "VIP",
          description: "Alertes en direct et analyses exclusives de marché.",
          inviteLink: "https://t.me/+MansaVipSignals",
          subscribersCount: 1420,
        },
        {
          id: "tg-lounge",
          name: `${subscription.companyName} · Community Lounge`,
          tag: "Community",
          description: "Échanges et entraide entre membres actifs de la communauté.",
          inviteLink: "https://t.me/+MansaMembersLounge",
          subscribersCount: 890,
        },
        {
          id: "tg-replays",
          name: `${subscription.companyName} · Replays & Resources`,
          tag: "Resources",
          description: "Fichiers téléchargeables, guides et enregistrements complets.",
          inviteLink: "https://t.me/+MansaReplaysHub",
          subscribersCount: 650,
        },
      ];

  // Default discord channels / servers
  const discordChannelsList: DiscordChannelItem[] = (subscription.discordChannels && subscription.discordChannels.length > 0)
    ? subscription.discordChannels
    : [
        {
          id: "dc-main",
          name: `${subscription.companyName} · Official Community HQ`,
          tag: "Official HQ",
          description: "Serveur principal avec salons de discussion, annonces et vocaux.",
          inviteLink: subscription.discordInvite || "https://discord.gg/mansa-official",
          subscribersCount: 2350,
          role: "VIP Member",
        },
        {
          id: "dc-signals",
          name: `${subscription.companyName} · Trading & Live Analysis`,
          tag: "Signals & Voice",
          description: "Salons spécialisés, alertes de trading et sessions partagées.",
          inviteLink: "https://discord.gg/mansa-trading",
          subscribersCount: 1820,
          role: "Trader Pro",
        },
        {
          id: "dc-networking",
          name: `${subscription.companyName} · Mastermind & Networking`,
          tag: "Mastermind",
          description: "Réseautage fermé et sessions vocales privées chaque semaine.",
          inviteLink: "https://discord.gg/mansa-mastermind",
          subscribersCount: 940,
          role: "Elite Pass",
        },
      ];

  const [selectedChannel, setSelectedChannel] = useState<TelegramChannelItem>(channelsList[0]);
  const [selectedDiscordChannel, setSelectedDiscordChannel] = useState<DiscordChannelItem>(discordChannelsList[0]);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedShareToast, setCopiedShareToast] = useState(false);
  const [activeMembersTooltip, setActiveMembersTooltip] = useState(false);
  const [activeNotifTooltip, setActiveNotifTooltip] = useState(false);

  const [copiedDiscordLink, setCopiedDiscordLink] = useState(false);
  const [copiedDiscordShareToast, setCopiedDiscordShareToast] = useState(false);
  const [activeDiscordMembersTooltip, setActiveDiscordMembersTooltip] = useState(false);
  const [activeDiscordNotifTooltip, setActiveDiscordNotifTooltip] = useState(false);

  const [claimToast, setClaimToast] = useState(false);
  const [discordClaimToast, setDiscordClaimToast] = useState(false);

  const [supportMessage, setSupportMessage] = useState("");
  const [supportChatList, setSupportChatList] = useState<Array<{
    id: string;
    sender: "user" | "creator";
    text: string;
    time: string;
  }>>([
    {
      id: "msg-1",
      sender: "creator",
      text: `Bienvenue dans l'espace membre officiel de ${subscription.companyName} ! Votre abonnement est actif. Si vous avez besoin d'aide pour vos accès Telegram, Discord ou vos services inclus, écrivez-nous ici.`,
      time: "10:15",
    },
  ]);

  const handleSelectChannelToClaim = (channel: TelegramChannelItem) => {
    setSelectedChannel(channel);
    setTelegramFlowStep("claim_qr");
  };

  const handleProceedToGateway = () => {
    setTelegramFlowStep("telegram_gateway");
  };

  const handleCopyLink = () => {
    if (selectedChannel?.inviteLink) {
      navigator.clipboard.writeText(selectedChannel.inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShareToast(true);
    setTimeout(() => setCopiedShareToast(false), 2500);
  };

  const handleOpenTelegram = () => {
    if (selectedChannel?.inviteLink) {
      window.open(selectedChannel.inviteLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleClaimTelegramInvite = (channel?: TelegramChannelItem) => {
    const target = channel || selectedChannel;
    if (target?.inviteLink) {
      window.open(target.inviteLink, "_blank", "noopener,noreferrer");
      setClaimToast(true);
      setTimeout(() => setClaimToast(false), 3500);
    }
  };

  // Discord Handlers
  const handleSelectDiscordToClaim = (channel: DiscordChannelItem) => {
    setSelectedDiscordChannel(channel);
    setDiscordFlowStep("claim_qr");
  };

  const handleProceedToDiscordGateway = () => {
    setDiscordFlowStep("discord_gateway");
  };

  const handleCopyDiscordLink = () => {
    if (selectedDiscordChannel?.inviteLink) {
      navigator.clipboard.writeText(selectedDiscordChannel.inviteLink);
      setCopiedDiscordLink(true);
      setTimeout(() => setCopiedDiscordLink(false), 2500);
    }
  };

  const handleCopyDiscordShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedDiscordShareToast(true);
    setTimeout(() => setCopiedDiscordShareToast(false), 2500);
  };

  const handleOpenDiscord = () => {
    if (selectedDiscordChannel?.inviteLink) {
      window.open(selectedDiscordChannel.inviteLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleClaimDiscordInvite = (channel?: DiscordChannelItem) => {
    const target = channel || selectedDiscordChannel;
    if (target?.inviteLink) {
      window.open(target.inviteLink, "_blank", "noopener,noreferrer");
      setDiscordClaimToast(true);
      setTimeout(() => setDiscordClaimToast(false), 3500);
    }
  };

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "user" as const,
      text: supportMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setSupportChatList((prev) => [...prev, newMsg]);
    setSupportMessage("");

    // Quick auto-reply acknowledgment from support
    setTimeout(() => {
      setSupportChatList((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: "creator",
          text: `Message bien reçu. L'équipe technique de ${subscription.companyName} est notifiée et vous répondra dans les plus brefs délais.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1000);
  };

  const totalChannels = channelsList.length;

  const renderSidebarContent = (isMobile: boolean = false) => (
    <>
      <div className="p-3.5 space-y-4">
        {/* Top Mini Card of Enterprise matching screenshot */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#14161b] border border-white/5 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative size-9 rounded-xl bg-gradient-to-br from-indigo-950 via-purple-900 to-black border border-white/15 flex items-center justify-center text-xs font-black text-white shrink-0 overflow-hidden shadow-inner">
              {subscription.companyLogo ? (
                <img src={subscription.companyLogo} alt={subscription.companyName} className="size-full object-cover" />
              ) : (
                <span>{subscription.companyInitials || subscription.companyName.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-white truncate tracking-tight">{subscription.companyName}</h2>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span>en ligne</span>
              </div>
            </div>
          </div>
          {isMobile ? (
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              title="Fermer le menu"
            >
              <X className="size-4" />
            </button>
          ) : (
            onBackToPersonal && (
              <button
                onClick={onBackToPersonal}
                className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors cursor-pointer font-medium"
                title="Quitter et revenir à l'espace créateur"
              >
                Quitter
              </button>
            )
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 text-xs font-medium">
          {/* Accueil */}
          <button
            onClick={() => {
              setActiveTab("accueil");
              if (isMobile) setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer min-h-[44px] ${
              activeTab === "accueil"
                ? "bg-[#181a20] text-white font-semibold border border-white/10 shadow-sm"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            <Home className="size-4 text-zinc-300" />
            <span>Accueil</span>
          </button>

          {/* Chat de support */}
          <button
            onClick={() => {
              setActiveTab("support");
              if (isMobile) setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer min-h-[44px] ${
              activeTab === "support"
                ? "bg-[#181a20] text-white font-semibold border border-white/10 shadow-sm"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            <MessageSquare className="size-4 text-zinc-300" />
            <span>Chat de support</span>
          </button>

          {/* Telegram Access */}
          <button
            onClick={() => {
              setActiveTab("telegram");
              setTelegramFlowStep("channels_list");
              if (isMobile) setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer min-h-[44px] ${
              activeTab === "telegram"
                ? "bg-[#181a20] text-white font-semibold border border-white/10 shadow-sm"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="size-4 flex items-center justify-center text-[#229ED9]">
                <TelegramIcon className="size-4" />
              </div>
              <span className={activeTab === "telegram" ? "text-white font-bold" : "text-zinc-200"}>
                Telegram
              </span>
            </div>
            {hasTelegramAccess ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#229ED9]/15 text-[#229ED9]">
                {totalChannels}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                <Lock className="size-2.5" />
                <span>VIP</span>
              </span>
            )}
          </button>

          {/* Discord Access */}
          <button
            onClick={() => {
              setActiveTab("discord");
              setDiscordFlowStep("channels_list");
              if (isMobile) setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer min-h-[44px] ${
              activeTab === "discord"
                ? "bg-[#181a20] text-white font-semibold border border-white/10 shadow-sm"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="size-4 flex items-center justify-center text-[#5865F2]">
                <DiscordIcon className="size-4" />
              </div>
              <span className={activeTab === "discord" ? "text-white font-bold" : "text-zinc-200"}>
                Discord
              </span>
            </div>
            {hasDiscordAccess ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#5865F2]/15 text-[#8c97f8]">
                {discordChannelsList.length}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                <Lock className="size-2.5" />
                <span>VIP</span>
              </span>
            )}
          </button>

          {/* Offres & Produits de l'entreprise */}
          <button
            onClick={() => {
              setActiveTab("accueil");
              setCompanyTab("produits");
              if (isMobile) setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer min-h-[44px] ${
              activeTab === "accueil" && companyTab === "produits"
                ? "bg-[#181a20] text-white font-semibold border border-white/10 shadow-sm"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="size-4 text-amber-400" />
              <span className={activeTab === "accueil" && companyTab === "produits" ? "text-white font-bold" : "text-zinc-200"}>
                Offres & Produits
              </span>
            </div>
            {hasPaidOffer ? (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                Inclus
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                <Lock className="size-2.5" />
                <span>Offres</span>
              </span>
            )}
          </button>
        </nav>

        {isMobile && onBackToPersonal && (
          <div className="pt-2 border-t border-white/5">
            <button
              onClick={() => {
                setIsMobileSidebarOpen(false);
                onBackToPersonal();
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer min-h-[44px]"
            >
              <ChevronLeft className="size-4 text-zinc-400" />
              <span>Mon Espace Personnel</span>
            </button>
          </div>
        )}
      </div>

      {/* Subscription Status Footer */}
      <div className="p-3.5 border-t border-white/[0.08] space-y-2">
        {hasPaidOffer ? (
          <div className="p-3 rounded-xl bg-[#14151a] border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Statut</span>
              <span className="text-emerald-400 font-bold font-mono">Offre Active</span>
            </div>
            <div className="text-xs font-bold text-white truncate">{subscription.productName}</div>
            <div className="text-[10px] text-zinc-500">{subscription.priceDisplay}</div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Lock className="size-3 text-amber-400" />
                <span>Membre Simple</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-1.5 py-0.5 rounded">
                Sans offre
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-tight">
              Accès gratuit : Accueil et Support. Offres verrouillées.
            </p>
            <button
              onClick={() => {
                setActiveTab("accueil");
                setCompanyTab("produits");
                if (isMobile) setIsMobileSidebarOpen(false);
              }}
              className="w-full py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-bold transition-all cursor-pointer text-center"
            >
              Débloquer une offre
            </button>
          </div>
        )}
      </div>
    </>
  );

  // List of enterprise rail items ("les cases entreprise sur le cote comme sur l'image")
  const defaultRailCompanies = [
    {
      id: subscription.id,
      name: subscription.companyName,
      type: "active",
      initials: subscription.companyInitials || "FF",
      logo: subscription.companyLogo,
      badge: null,
    },
    {
      id: "sub-bs-syndicate",
      name: "BS Syndicate",
      type: "text",
      initials: "BS",
      badge: null,
    },
    {
      id: "sub-gs-trading",
      name: "GS Global Scalping",
      type: "text",
      initials: "GS",
      badge: null,
    },
    {
      id: "sub-devkreativ",
      name: "Whop Alpha / DevKreativ",
      type: "whop_yellow",
      initials: "W",
      badge: null,
    },
    {
      id: "sub-ecommerce-mastery",
      name: "Green Capital Scalper",
      type: "green_stripes",
      initials: "GC",
      badge: null,
    },
    {
      id: "sub-alpha-bets",
      name: "Alpha Bets Club Pro",
      type: "avatar",
      avatarUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80",
      badge: "99+",
    },
    {
      id: "sub-victory-odds",
      name: "Victory Odds VIP",
      type: "purple_shield",
      initials: "VO",
      badge: null,
    },
    {
      id: "sub-profitic",
      name: "Nexus Growth VIP",
      type: "green_icon",
      initials: "NG",
      badge: "8",
    },
  ];

  return (
    <div className="flex h-full w-full flex-1 overflow-hidden relative select-none bg-[#08090b] text-[#eeeeee] font-sans antialiased">
      {/* 1. LEFTMOST RAIL: Enterprise Squares ("les cases entreprise sur le cote comme sur l'image") */}
      <div className="w-[72px] shrink-0 bg-[#08090a] border-r border-white/5 flex flex-col items-center py-3 gap-2 overflow-y-auto no-scrollbar select-none z-10">
          
          {/* 1. Return to Personal Workspace */}
          {onBackToPersonal && (
            <div className="relative group flex items-center justify-center w-full px-2">
              <button
                onClick={onBackToPersonal}
                className="size-11 rounded-2xl bg-[#16171b] hover:bg-white/10 hover:text-white text-zinc-400 border border-white/10 flex items-center justify-center transition-all cursor-pointer"
                title="Espace Personnel"
              >
                <User className="size-5" />
              </button>
              <div className="absolute left-[72px] z-50 px-2.5 py-1 rounded-lg bg-[#181a22] text-xs font-semibold text-white border border-white/10 shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150">
                Espace Personnel
              </div>
            </div>
          )}

          {/* DÉMARCATION 1 : MES ENTREPRISES (CRÉATEUR) */}
          <div className="w-full flex flex-col items-center gap-1.5 pt-1">
            <span
              className="text-[9px] font-black uppercase tracking-wider text-emerald-400/90 px-1 select-none flex items-center gap-0.5 cursor-default"
              title="Mes Entreprises (Créateur)"
            >
              👑
            </span>

            {/* Owned creator companies */}
            {(creatorCompanies.length > 0 ? creatorCompanies : [
              { id: "comp-cadre-financier", name: "Cadre financier", logoInitials: "FF", colorGradient: "from-emerald-950 via-slate-900 to-black" }
            ]).map((comp: any) => {
              const isOwnerActive = subscription.companyId === comp.id || subscription.id === comp.id;
              return (
                <div key={comp.id} className="relative group flex items-center justify-center w-full px-2">
                  {isOwnerActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-emerald-400 rounded-r-full shadow-sm shadow-emerald-400/50" />
                  )}

                  <button
                    onClick={() => {
                      if (onSelectCreatorCompany) {
                        onSelectCreatorCompany(comp);
                      } else if (onSelectSubscription) {
                        onSelectSubscription(comp.id);
                      }
                    }}
                    className={`size-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative overflow-hidden select-none ${
                      isOwnerActive
                        ? "ring-2 ring-emerald-400 scale-105 shadow-lg shadow-emerald-500/20"
                        : "border border-white/10 hover:border-emerald-400/50 hover:scale-105 opacity-85 hover:opacity-100"
                    }`}
                    title={`Mon Entreprise : ${comp.name}`}
                  >
                    <div
                      className={`size-full bg-gradient-to-br ${
                        comp.colorGradient || "from-emerald-950 via-slate-900 to-black"
                      } flex items-center justify-center text-[10px] font-black text-white font-mono`}
                    >
                      <span>{comp.logoInitials || comp.name.substring(0, 2).toUpperCase()}</span>
                    </div>
                  </button>

                  <div className="absolute left-[72px] z-50 px-2.5 py-1 rounded-lg bg-[#181a22] text-xs font-semibold text-white border border-white/10 shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150">
                    👑 Créateur : {comp.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* SÉPARATEUR VISUEL CLAIR (DÉMARCATION) */}
          <div className="w-8 h-px bg-white/15 my-1.5 shrink-0 flex items-center justify-center relative">
            <span className="absolute bg-[#08090a] px-1 text-[8px] text-zinc-500 font-mono">•••</span>
          </div>

          {/* DÉMARCATION 2 : ENTREPRISES MEMBRE (ADHÉSIONS) */}
          <div className="w-full flex flex-col items-center gap-1.5 flex-1">
            <span
              className="text-[9px] font-black uppercase tracking-wider text-blue-400/90 px-1 select-none flex items-center gap-0.5 cursor-default"
              title="Entreprises Membre (Adhésions)"
            >
              🛡️
            </span>

            {/* Member companies */}
            {(allSubscriptions.length > 0 ? allSubscriptions : defaultRailCompanies).map((item: any, idx: number) => {
              const isActive = item.id === subscription.id || item.companyId === subscription.companyId || (idx === 0 && !allSubscriptions.some(c => c.id === subscription.id && c !== item));
              return (
                <div key={(item.id || idx) + "-rail"} className="relative group flex items-center justify-center w-full px-2">
                  {/* Left vertical indicator pill */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-blue-500 rounded-r-full shadow-sm shadow-blue-500/50" />
                  )}

                  <button
                    onClick={() => {
                      if (onSelectSubscription) {
                        onSelectSubscription(item.id);
                      }
                    }}
                    className={`size-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative overflow-hidden select-none ${
                      isActive
                        ? "ring-2 ring-blue-500 scale-105 shadow-lg shadow-blue-500/20"
                        : "border border-white/10 hover:border-blue-400/50 hover:scale-105 opacity-85 hover:opacity-100"
                    }`}
                    title={`Espace Membre : ${item.companyName || item.name}`}
                  >
                    {item.companyLogo || item.logo ? (
                      <img src={item.companyLogo || item.logo} alt={item.companyName || item.name} className="size-full object-cover" />
                    ) : item.type === "whop_yellow" ? (
                      <div className="size-full bg-[#D8FF3F] text-black font-black text-lg flex items-center justify-center">W</div>
                    ) : item.type === "green_stripes" ? (
                      <div className="size-full bg-[#0b1712] border border-emerald-500/30 text-emerald-400 flex flex-col items-center justify-center gap-0.5">
                        <span className="w-5 h-1 bg-emerald-400 rounded-full" />
                        <span className="w-3.5 h-1 bg-emerald-400/70 rounded-full" />
                      </div>
                    ) : item.type === "purple_shield" ? (
                      <div className="size-full bg-[#13111f] border border-purple-500/30 text-purple-400 flex items-center justify-center">
                        <ShieldCheck className="size-5" />
                      </div>
                    ) : (
                      <div
                        className={`size-full bg-gradient-to-br ${
                          item.companyGradient || "from-blue-950 via-indigo-950 to-black"
                        } flex items-center justify-center text-[10px] font-black text-white font-mono`}
                      >
                        <span>{item.companyInitials || item.initials || (item.companyName || item.name || "EM").substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}

                    {/* Badge on top right */}
                    {(item.badge || item.unreadCount) && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full ring-2 ring-[#08090a] shadow-sm">
                        {item.badge || item.unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Tooltip on hover */}
                  <div className="absolute left-[72px] z-50 px-2.5 py-1 rounded-lg bg-[#181a22] text-xs font-semibold text-white border border-white/10 shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150">
                    🛡️ Membre : {item.companyName || item.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Plus button to discover more */}
          <div className="relative group flex items-center justify-center w-full px-2 pt-2 border-t border-white/10 shrink-0">
            <button
              onClick={onOpenMarketplace}
              className="size-11 rounded-2xl bg-white/5 hover:bg-white/10 hover:text-emerald-400 text-zinc-400 border border-dashed border-white/20 hover:border-emerald-400 flex items-center justify-center transition-all cursor-pointer"
              title="Découvrir d'autres entreprises"
            >
              <Plus className="size-5" />
            </button>
            <div className="absolute left-[72px] z-50 px-2.5 py-1 rounded-lg bg-[#181a22] text-xs font-semibold text-white border border-white/10 shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150">
              Découvrir de nouvelles offres
            </div>
          </div>
        </div>

        {/* SECONDARY ENTERPRISE SIDEBAR (Desktop Fixed) */}
        <aside className="hidden lg:flex w-64 shrink-0 border-r border-white/[0.08] bg-[#0e1014] flex-col justify-between select-none">
          {renderSidebarContent(false)}
        </aside>

        {/* MOBILE / TABLET SLIDING DRAWER */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <aside className="relative w-72 max-w-[85vw] bg-[#0c0d10] border-r border-white/10 shadow-2xl flex flex-col justify-between select-none z-10 animate-in slide-in-from-left duration-200 overflow-y-auto">
              {renderSidebarContent(true)}
            </aside>
          </div>
        )}

        {/* MAIN WORKSPACE CONTENT */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#08090b] select-text">
        
        {/* ============================================================ */}
        {/* VIEW 1: VUE D'ACCUEIL DE L'ENTREPRISE (DARK MODE HAUT DE GAMME) */}
        {/* ============================================================ */}
        {activeTab === "accueil" && (
          <div className="w-full flex-1 flex flex-col pb-16 animate-in fade-in duration-150">
            
            {/* 1. EN-TÊTE VISUEL */}
            {/* Image de bannière large occupant toute la largeur de la zone de contenu principale */}
            <div className="relative w-full h-44 sm:h-64 md:h-72 lg:h-80 overflow-hidden bg-[#111216] select-none group">
              <img
                src={currentSub.companyBanner || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1800&q=85"}
                alt={`Bannière ${currentSub.companyName}`}
                className="w-full h-full object-cover object-center"
              />
              {/* Subtle gradient vignette to seamlessly transition to the dark canvas */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0d] via-[#0a0b0d]/30 to-transparent pointer-events-none" />

              {/* Company Banner Edit Button */}
              <button
                onClick={() => setIsBrandingModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg transition-all cursor-pointer absolute top-3 right-3 z-20 active:scale-95"
                title="Modifier la bannière et la photo de profil de l'entreprise"
              >
                <Camera className="size-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Configurer la bannière & logo</span>
                <span className="sm:hidden">Bannière</span>
              </button>

              {/* Mobile / Tablet Top Navigation Bar over Banner */}
              <div className="absolute top-3 left-3 right-28 z-20 flex items-center justify-between lg:hidden pointer-events-auto">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white flex items-center gap-1.5 shadow-lg min-h-[40px] min-w-[40px] justify-center cursor-pointer active:scale-95 transition-all"
                    title="Ouvrir le menu de l'entreprise"
                  >
                    <Menu className="size-4" />
                    <span className="text-xs font-semibold pr-1">Menu</span>
                  </button>
                  {onBackToPersonal && (
                    <button
                      onClick={onBackToPersonal}
                      className="px-2.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-white flex items-center gap-1 text-xs font-medium shadow-lg min-h-[40px] cursor-pointer active:scale-95 transition-all"
                      title="Retour à mon espace"
                    >
                      <ChevronLeft className="size-3.5" />
                      <span className="hidden sm:inline">Mon Espace</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Toast for profile link sharing */}
              {copiedProfileShare && (
                <div className="absolute top-14 right-3 z-20 px-3.5 py-2 rounded-xl bg-[#14151a] border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 shadow-xl animate-in fade-in slide-in-from-top-2">
                  <Check className="size-3.5 text-emerald-400" />
                  <span>Lien copié !</span>
                </div>
              )}
            </div>

            {/* 2. BLOC D'INFORMATIONS */}
            <div className="px-4 sm:px-8 lg:px-10 relative">
              {/* Photo de profil carrée aux coins arrondis superposée sur le coin inférieur gauche de la bannière */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 -mt-12 sm:-mt-18 md:-mt-22 mb-4">
                <div className="flex items-end gap-3 sm:gap-5">
                  <div
                    onClick={() => setIsBrandingModalOpen(true)}
                    className="relative size-24 sm:size-36 md:size-40 rounded-2xl sm:rounded-3xl border-4 border-[#0a0b0d] bg-[#14161f] shadow-2xl overflow-hidden shrink-0 group cursor-pointer"
                    title="Cliquer pour configurer la photo de profil / logo et la bannière"
                  >
                    {currentSub.companyLogo ? (
                      <img
                        src={currentSub.companyLogo}
                        alt={currentSub.companyName}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="size-full bg-gradient-to-br from-indigo-950 via-slate-900 to-black flex items-center justify-center text-3xl sm:text-4xl font-black text-white">
                        {currentSub.companyInitials || currentSub.companyName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    {/* Hover overlay with Camera to edit */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 select-none">
                      <Camera className="size-6 text-emerald-400" />
                      <span className="text-[11px] font-bold text-center px-1">Modifier logo</span>
                    </div>
                    {/* Online status indicator */}
                    <span
                      className="absolute bottom-2 sm:bottom-2.5 right-2 sm:right-2.5 size-3 sm:size-4 rounded-full bg-emerald-400 ring-4 ring-[#0a0b0d]"
                      title="Espace d'entreprise actif"
                    />
                  </div>
                </div>

                {/* Des icônes d'action et de gestion alignées à l'extrême droite */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start sm:self-end pt-1 sm:pt-0">
                  {/* Share button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopiedProfileShare(true);
                      setTimeout(() => setCopiedProfileShare(false), 2500);
                    }}
                    className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.08] text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm min-h-[40px] min-w-[40px] flex items-center justify-center"
                    title="Partager le profil de l'entreprise"
                  >
                    <Share2 className="size-4" />
                  </button>

                  {/* Notifications bell */}
                  <button
                    onClick={() => setIsNotifSubscribed(!isNotifSubscribed)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-sm relative ${
                      isNotifSubscribed
                        ? "bg-blue-600/15 border-blue-500/30 text-blue-400 hover:bg-blue-600/25"
                        : "bg-white/[0.04] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.08]"
                    }`}
                    title={isNotifSubscribed ? "Notifications activées" : "Activer les notifications"}
                  >
                    <Bell className="size-4" />
                    {isNotifSubscribed && (
                      <span className="absolute top-2 right-2 size-1.5 rounded-full bg-blue-400" />
                    )}
                  </button>

                  {/* Direct Contact / Support Message */}
                  <button
                    onClick={() => setActiveTab("support")}
                    className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
                    title="Écrire à l'équipe support"
                  >
                    <MessageSquare className="size-4" />
                  </button>

                  {/* More options / management */}
                  <div className="relative">
                    <button
                      onClick={() => setOptionsDropdownOpen(!optionsDropdownOpen)}
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
                      title="Options et gestion"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>

                    {optionsDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#14161f] border border-white/10 shadow-2xl p-1.5 z-30 space-y-0.5 animate-in fade-in duration-150">
                        <button
                          onClick={() => {
                            setIsBrandingModalOpen(true);
                            setOptionsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-emerald-400 hover:bg-white/5 transition-colors text-left font-medium"
                        >
                          <Camera className="size-3.5 text-emerald-400" />
                          <span>Configurer bannière & logo</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab("telegram");
                            setOptionsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                        >
                          <TelegramIcon className="size-3.5 text-[#229ED9]" />
                          <span>Gérer Telegram VIP</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab("discord");
                            setOptionsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                        >
                          <DiscordIcon className="size-3.5 text-[#5865F2]" />
                          <span>Serveur Discord</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab("support");
                            setOptionsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                        >
                          <HelpCircle className="size-3.5 text-zinc-400" />
                          <span>Centre d'aide & FAQ</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Primary Member Pass Action Button */}
                  {hasPaidOffer ? (
                    <button
                      onClick={() => {
                        if (hasTelegramAccess) {
                          setActiveTab("telegram");
                          setTelegramFlowStep("channels_list");
                        } else if (hasDiscordAccess) {
                          setActiveTab("discord");
                          setDiscordFlowStep("channels_list");
                        } else {
                          setCompanyTab("produits");
                        }
                      }}
                      className="ml-1 px-4 py-2.5 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] active:scale-[0.99] text-white text-xs font-bold tracking-wide flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/25"
                    >
                      <span>Accès Membre VIP</span>
                      <ChevronRight className="size-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setCompanyTab("produits")}
                      className="ml-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-black text-xs font-bold tracking-wide flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/25"
                    >
                      <Sparkles className="size-3.5 text-black" />
                      <span>Débloquer les offres</span>
                      <ChevronRight className="size-3.5 text-black" />
                    </button>
                  )}
                </div>
              </div>

              {/* Informations textuelles & Métadonnées */}
              <div className="space-y-3 pt-1">
                {/* Le nom de l'entreprise affiché en gros caractères */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {currentSub.companyName}
                  </h1>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold"
                    title="Entreprise officielle vérifiée"
                  >
                    <ShieldCheck className="size-3.5" />
                    <span>Vérifié</span>
                  </span>

                  {hasPaidOffer ? (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold"
                      title="Membre avec offre active"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>Membre VIP Actif</span>
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold"
                      title="Adhésion simple sans offre payée"
                    >
                      <Lock className="size-3.5" />
                      <span>Membre Simple (Sans offre)</span>
                    </span>
                  )}
                </div>

                {/* Une ligne de métadonnées indiquant la localisation et le créateur */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-zinc-500 shrink-0" />
                    <span>Paris, France</span>
                  </div>
                  <span className="text-zinc-700 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5">
                    <User className="size-3.5 text-zinc-500 shrink-0" />
                    <span>
                      Créé par <strong className="text-zinc-200 font-semibold">{subscription.companyName} Labs</strong>
                    </span>
                  </div>
                  <span className="text-zinc-700 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-zinc-500 shrink-0" />
                    <span>Membre depuis {subscription.subscribedAt || "Septembre 2026"}</span>
                  </div>
                </div>

                {/* Un compteur de membres accompagné des avatars circulaires superposés des derniers inscrits */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex -space-x-2 overflow-hidden shrink-0">
                    {[
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
                      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
                    ].map((avatarUrl, idx) => (
                      <img
                        key={idx}
                        src={avatarUrl}
                        alt="Membre inscrit"
                        className="inline-block size-7 sm:size-8 rounded-full ring-2 ring-[#0a0b0d] object-cover"
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="font-bold text-white tracking-tight">3 480</span>
                    <span className="text-zinc-400">membres</span>
                    <span className="inline-flex items-center gap-1.5 ml-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{subscription.onlineMembersCount || 1420} en ligne</span>
                    </span>
                  </div>
                </div>

                {/* Free Member Status Notice Banner */}
                {!hasPaidOffer && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900/60 to-transparent border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="size-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                        <Lock className="size-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>Adhésion membre simple active (Sans offre payée)</span>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-semibold">
                            Offres verrouillées
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                          Vous avez rejoint l'entreprise <strong>{subscription.companyName}</strong>. Vous avez accès à la page d'accueil et au chat de support. Pour débloquer les canaux Telegram VIP, le serveur Discord ou les formations, souscrivez à une offre.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCompanyTab("produits")}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <ShoppingBag className="size-3.5 text-black" />
                      <span>Voir les offres</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. NAVIGATION INTERNE : BARRE D'ONGLETS HORIZONTALE */}
            {/* Comprenant "Accueil" (actif avec indicateur souligné en bleu), "Produits" et "Avis" */}
            <div className="mt-6 sm:mt-8 border-b border-white/[0.08] px-4 sm:px-8 lg:px-10 bg-[#0a0b0d] overflow-x-auto no-scrollbar">
              <nav className="flex items-center gap-6 sm:gap-8 -mb-px min-w-max">
                {/* Onglet Accueil (actif par défaut avec indicateur souligné en bleu) */}
                <button
                  onClick={() => setCompanyTab("accueil")}
                  className={`py-3.5 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 relative ${
                    companyTab === "accueil"
                      ? "text-white border-b-2 border-blue-500 font-bold"
                      : "text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent"
                  }`}
                >
                  <Home className="size-4" />
                  <span>Accueil</span>
                </button>

                {/* Onglet Produits */}
                <button
                  onClick={() => setCompanyTab("produits")}
                  className={`py-3.5 text-sm transition-all cursor-pointer flex items-center gap-2 relative ${
                    companyTab === "produits"
                      ? "text-white border-b-2 border-blue-500 font-bold"
                      : "text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent"
                  }`}
                >
                  <FileText className="size-4" />
                  <span>Produits</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-[11px] text-zinc-400 font-mono">
                    3
                  </span>
                </button>

                {/* Onglet Avis */}
                <button
                  onClick={() => setCompanyTab("avis")}
                  className={`py-3.5 text-sm transition-all cursor-pointer flex items-center gap-2 relative ${
                    companyTab === "avis"
                      ? "text-white border-b-2 border-blue-500 font-bold"
                      : "text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent"
                  }`}
                >
                  <Star className="size-4 text-amber-400 fill-amber-400/20" />
                  <span>Avis</span>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    (142)
                  </span>
                </button>
              </nav>
            </div>

            {/* 4. ZONE DE CONTENU */}
            <div className="px-4 sm:px-8 lg:px-10 py-5 sm:py-8">
              
              {/* VUE CONTENU : ONGLET ACCUEIL (Flux de publications ou d'actualités épuré) */}
              {companyTab === "accueil" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-150">
                  
                  {/* Flux principal de publications / actualités (8 cols sur grand écran) */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Publication Épinglée */}
                    <div className="rounded-2xl border border-white/[0.09] bg-[#111318] p-5 sm:p-6 space-y-4 hover:border-white/15 transition-all shadow-lg shadow-black/40">
                      
                      {/* En-tête de la publication */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-[#181a22] border border-white/10 overflow-hidden shrink-0">
                            {subscription.companyLogo ? (
                              <img
                                src={subscription.companyLogo}
                                alt={subscription.companyName}
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="size-full flex items-center justify-center text-xs font-black text-white bg-indigo-950">
                                {subscription.companyInitials || "VIP"}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{subscription.companyName}</span>
                              <span className="size-1 rounded-full bg-zinc-600" />
                              <span className="text-[11px] text-zinc-400 font-medium">Il y a 2h</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                              <span className="inline-flex items-center gap-1 text-blue-400 font-semibold">
                                <Pin className="size-3" />
                                <span>Publication Épinglée</span>
                              </span>
                              <span>•</span>
                              <span>Annonce Officielle VIP</span>
                            </div>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold">
                          Actualité
                        </span>
                      </div>

                      {/* Contenu textuel de la publication */}
                      <div className="space-y-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          🎯 Point de Marché Hebdomadaire & Alertes Algorithmiques
                        </h3>
                        <p>
                          Bienvenue à tous les nouveaux membres de la communauté ! Les analyses techniques détaillées et les ordres protégés sont en ligne dans vos canaux Telegram respectifs.
                        </p>
                        <p className="text-zinc-400">
                          Rappel essentiel : respectez rigoureusement votre gestion du risque (1 à 2% de bankroll par position). Notre équipe reste à votre écoute sur le salon support pour toute question.
                        </p>
                      </div>

                      {/* Encadré de performance / métrique intégrée au flux */}
                      <div className="p-4 rounded-xl bg-[#161820] border border-white/5 grid grid-cols-3 gap-3 text-center">
                        <div className="space-y-0.5">
                          <div className="text-[11px] text-zinc-400">Ratio Hebdo</div>
                          <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono">+18.4%</div>
                        </div>
                        <div className="space-y-0.5 border-x border-white/5">
                          <div className="text-[11px] text-zinc-400">Taux Réussite</div>
                          <div className="text-base sm:text-lg font-bold text-white font-mono">87.5%</div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-[11px] text-zinc-400">Signaux Actifs</div>
                          <div className="text-base sm:text-lg font-bold text-blue-400 font-mono">6 En cours</div>
                        </div>
                      </div>

                      {/* Barre d'interaction sociale sous la publication */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
                        <div className="flex items-center gap-4">
                          {/* Like button */}
                          <button
                            onClick={() => {
                              const isLiked = likedPosts["post-pinned"];
                              setLikedPosts((prev) => ({ ...prev, "post-pinned": !isLiked }));
                              setLikesCounts((prev) => ({
                                ...prev,
                                "post-pinned": isLiked ? prev["post-pinned"] - 1 : prev["post-pinned"] + 1,
                              }));
                            }}
                            className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg ${
                              likedPosts["post-pinned"]
                                ? "text-rose-400 bg-rose-500/10 font-bold"
                                : "hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <Heart className={`size-3.5 ${likedPosts["post-pinned"] ? "fill-rose-400" : ""}`} />
                            <span>{likesCounts["post-pinned"]}</span>
                          </button>

                          {/* Comments counter */}
                          <div className="flex items-center gap-1.5 py-1 px-2">
                            <MessageCircle className="size-3.5" />
                            <span>18 commentaires</span>
                          </div>
                        </div>

                        {/* Share */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            setCopiedProfileShare(true);
                            setTimeout(() => setCopiedProfileShare(false), 2500);
                          }}
                          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
                        >
                          <Share2 className="size-3.5" />
                          <span>Partager</span>
                        </button>
                      </div>
                    </div>

                    {/* Deuxième Publication : Mise à jour technique */}
                    <div className="rounded-2xl border border-white/[0.09] bg-[#111318] p-5 sm:p-6 space-y-4 hover:border-white/15 transition-all shadow-lg shadow-black/40">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-[#181a22] border border-white/10 overflow-hidden shrink-0">
                            {subscription.companyLogo ? (
                              <img
                                src={subscription.companyLogo}
                                alt={subscription.companyName}
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="size-full flex items-center justify-center text-xs font-black text-white bg-indigo-950">
                                {subscription.companyInitials || "VIP"}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{subscription.companyName}</span>
                              <span className="size-1 rounded-full bg-zinc-600" />
                              <span className="text-[11px] text-zinc-400 font-medium">Il y a 6h</span>
                            </div>
                            <div className="text-[11px] text-zinc-400">
                              Mise à jour d'infrastructure
                            </div>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                          Technique
                        </span>
                      </div>

                      <div className="space-y-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                        <h4 className="text-sm sm:text-base font-bold text-white">
                          ⚡ Déploiement des Bots Telegram & Discord v2.4
                        </h4>
                        <p>
                          La latence d'envoi de nos alertes instantanées est désormais réduite sous la barre des 250ms. Tous les salons vocaux et rôles ont été synchronisés avec succès.
                        </p>
                      </div>

                      {/* Interaction bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              const isLiked = likedPosts["post-2"];
                              setLikedPosts((prev) => ({ ...prev, "post-2": !isLiked }));
                              setLikesCounts((prev) => ({
                                ...prev,
                                "post-2": isLiked ? prev["post-2"] - 1 : prev["post-2"] + 1,
                              }));
                            }}
                            className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg ${
                              likedPosts["post-2"]
                                ? "text-rose-400 bg-rose-500/10 font-bold"
                                : "hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <Heart className={`size-3.5 ${likedPosts["post-2"] ? "fill-rose-400" : ""}`} />
                            <span>{likesCounts["post-2"]}</span>
                          </button>

                          <div className="flex items-center gap-1.5 py-1 px-2">
                            <MessageCircle className="size-3.5" />
                            <span>9 commentaires</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            setCopiedProfileShare(true);
                            setTimeout(() => setCopiedProfileShare(false), 2500);
                          }}
                          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
                        >
                          <Share2 className="size-3.5" />
                          <span>Partager</span>
                        </button>
                      </div>
                    </div>

                    {/* Troisième Publication : Fichier / Ressource */}
                    <div className="rounded-2xl border border-white/[0.09] bg-[#111318] p-5 sm:p-6 space-y-4 hover:border-white/15 transition-all shadow-lg shadow-black/40">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-[#181a22] border border-white/10 overflow-hidden shrink-0">
                            {subscription.companyLogo ? (
                              <img
                                src={subscription.companyLogo}
                                alt={subscription.companyName}
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="size-full flex items-center justify-center text-xs font-black text-white bg-indigo-950">
                                {subscription.companyInitials || "VIP"}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{subscription.companyName}</span>
                              <span className="size-1 rounded-full bg-zinc-600" />
                              <span className="text-[11px] text-zinc-400 font-medium">Hier</span>
                            </div>
                            <div className="text-[11px] text-zinc-400">
                              Ressource Téléchargeable
                            </div>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-semibold">
                          Guide PDF
                        </span>
                      </div>

                      <div className="space-y-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                        <h4 className="text-sm sm:text-base font-bold text-white">
                          📘 Guide Pratique : Psychologie & Gestion de Bankroll 2026
                        </h4>
                        <p>
                          Le support de formation complet est disponible pour l'ensemble des membres actifs. Retrouvez les 10 principes cardinaux pour maximiser votre espérance de gain.
                        </p>
                      </div>

                      {/* Download box */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#161822] border border-white/5 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-red-500/10 text-red-400 font-mono font-bold text-[10px]">
                            PDF
                          </div>
                          <div>
                            <div className="font-semibold text-white">Guide_VIP_Gestion_2026.pdf</div>
                            <div className="text-[10px] text-zinc-500">4.2 Mo · Téléchargement instantané</div>
                          </div>
                        </div>
                        <button
                          onClick={() => alert("Téléchargement du Guide VIP...")}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="size-3" />
                          <span>Télécharger</span>
                        </button>
                      </div>

                      {/* Interaction bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              const isLiked = likedPosts["post-3"];
                              setLikedPosts((prev) => ({ ...prev, "post-3": !isLiked }));
                              setLikesCounts((prev) => ({
                                ...prev,
                                "post-3": isLiked ? prev["post-3"] - 1 : prev["post-3"] + 1,
                              }));
                            }}
                            className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg ${
                              likedPosts["post-3"]
                                ? "text-rose-400 bg-rose-500/10 font-bold"
                                : "hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <Heart className={`size-3.5 ${likedPosts["post-3"] ? "fill-rose-400" : ""}`} />
                            <span>{likesCounts["post-3"]}</span>
                          </button>

                          <div className="flex items-center gap-1.5 py-1 px-2">
                            <MessageCircle className="size-3.5" />
                            <span>12 commentaires</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            setCopiedProfileShare(true);
                            setTimeout(() => setCopiedProfileShare(false), 2500);
                          }}
                          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
                        >
                          <Share2 className="size-3.5" />
                          <span>Partager</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Widgets d'accompagnement latéraux (4 cols sur grand écran) */}
                  <div className="lg:col-span-4 space-y-5">
                    
                    {/* Widget 1 : Vos Accès Inclus */}
                    <div className="rounded-2xl border border-white/[0.08] bg-[#111318] p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Accès & Communautés
                        </h4>
                        <span className="size-2 rounded-full bg-emerald-400" />
                      </div>

                      <div className="space-y-2.5">
                        {/* Telegram Link Card */}
                        <div
                          onClick={() => {
                            setActiveTab("telegram");
                            setTelegramFlowStep("channels_list");
                          }}
                          className="p-3.5 rounded-xl border border-white/5 bg-[#161820] hover:border-[#229ED9]/40 hover:bg-[#181c28] transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-[#229ED9]/20 text-[#229ED9] flex items-center justify-center shrink-0">
                              <TelegramIcon className="size-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white group-hover:text-[#229ED9] transition-colors">
                                Canaux Telegram VIP
                              </div>
                              <div className="text-[11px] text-zinc-400">
                                {totalChannels} salons sécurisés
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="size-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </div>

                        {/* Discord Link Card */}
                        {subscription.includedApps?.includes("Discord") && (
                          <div
                            onClick={() => {
                              setActiveTab("discord");
                              setDiscordFlowStep("channels_list");
                            }}
                            className="p-3.5 rounded-xl border border-white/5 bg-[#161820] hover:border-[#5865F2]/40 hover:bg-[#191b2c] transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-xl bg-[#5865F2]/20 text-[#5865F2] flex items-center justify-center shrink-0">
                                <DiscordIcon className="size-4" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white group-hover:text-[#8c97f8] transition-colors">
                                  Serveur Discord HQ
                                </div>
                                <div className="text-[11px] text-zinc-400">
                                  Salons vocaux & alertes
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="size-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Widget 2 : À propos & Règles de la communauté */}
                    <div className="rounded-2xl border border-white/[0.08] bg-[#111318] p-5 space-y-3.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Règles de la communauté
                      </h4>
                      <ul className="space-y-2 text-xs text-zinc-400">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="size-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span>Confidentialité stricte des signaux et analyses partagés.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="size-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span>Échanges bienveillants et constructifs dans les lounges.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="size-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span>Support technique joignable 7j/7 via le chat dédié.</span>
                        </li>
                      </ul>
                    </div>

                    {/* Widget 3 : Statut de l'abonnement Membre */}
                    <div className="rounded-2xl border border-white/[0.08] bg-[#111318] p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Offre actuelle</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-mono font-bold text-[10px]">
                          Actif
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white truncate">
                        {subscription.productName}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {subscription.priceDisplay}
                      </div>
                      <button
                        onClick={() => setActiveTab("support")}
                        className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium border border-white/5 transition-colors cursor-pointer"
                      >
                        Gérer mon abonnement
                      </button>
                    </div>

                  </div>

                </div>
              )}

              {/* VUE CONTENU : ONGLET PRODUITS */}
              {companyTab === "produits" && (
                <div className="space-y-6 animate-in fade-in duration-150 max-w-5xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="size-5 text-amber-400" />
                        <span>Offres & Produits de {subscription.companyName}</span>
                      </h3>
                      <p className="text-xs text-zinc-400">
                        {hasPaidOffer
                          ? "Vous avez accès aux offres que vous avez souscrites. Les autres offres de l'entreprise restent verrouillées jusqu'à leur achat."
                          : "Vous êtes membre de l'entreprise sans offre payée (accès gratuit à l'accueil et au support). Choisissez une offre ci-dessous pour débloquer les canaux et services."}
                      </p>
                    </div>

                    {!hasPaidOffer && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold shrink-0">
                        <Lock className="size-3" />
                        <span>Adhésion gratuite active</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                    {/* Offre 1 : Telegram VIP Signals */}
                    <div
                      className={`rounded-2xl border p-6 space-y-4 relative flex flex-col justify-between transition-all ${
                        hasTelegramAccess
                          ? "border-emerald-500/40 bg-[#12141c] shadow-lg shadow-emerald-500/5"
                          : "border-white/[0.08] bg-[#111318] hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="size-10 rounded-xl bg-[#229ED9]/15 text-[#229ED9] flex items-center justify-center shrink-0">
                          <TelegramIcon className="size-5" />
                        </div>
                        {hasTelegramAccess ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Check className="size-3" />
                            <span>Inclus & Actif</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Lock className="size-2.5" />
                            <span>Non souscrit</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-mono text-zinc-400">Canaux Privés Telegram</div>
                        <h4 className="text-base font-bold text-white">Pass Signaux Telegram VIP</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Accès exclusif aux canaux Telegram sécurisés de {subscription.companyName} : alertes en temps réel, analyses techniques quotidiennes et récapitulatifs marchés.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-sm font-bold text-white font-mono">19 000 FCFA / mois</span>
                        {hasTelegramAccess ? (
                          <button
                            onClick={() => {
                              setActiveTab("telegram");
                              setTelegramFlowStep("channels_list");
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-[#229ED9]/20 hover:bg-[#229ED9]/30 text-[#229ED9] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Accéder à Telegram</span>
                            <ChevronRight className="size-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setCheckoutModalOffer({
                                id: `offer-tg-${subscription.companyId}`,
                                title: `Pass Signaux Telegram VIP (${subscription.companyName})`,
                                companyId: subscription.companyId,
                                companyName: subscription.companyName,
                                companyInitials: subscription.companyInitials,
                                category: "trading",
                                type: "membership",
                                priceDisplay: "19 000 FCFA / mois",
                                priceAmount: 19000,
                                currency: "XOF",
                                pricingType: "paid",
                                billingCycle: "monthly",
                                description: `Accès direct aux canaux Telegram VIP de ${subscription.companyName}.`,
                                imageUrl: subscription.companyBanner || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
                                includedApps: ["dashboard", "support", "telegram"],
                                telegramChannels: (subscription.telegramChannels && subscription.telegramChannels.length > 0)
                                  ? subscription.telegramChannels
                                  : [
                                      {
                                        id: "tg-vip-auto",
                                        name: `${subscription.companyName} · Signaux VIP`,
                                        tag: "VIP",
                                        description: "Canal officiel de signaux et d'analyses.",
                                        inviteLink: "https://t.me/+MansaVipSignals",
                                        subscribersCount: 1420,
                                      },
                                    ],
                              });
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-[#229ED9] hover:bg-[#1b8ec5] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-md shadow-[#229ED9]/20"
                          >
                            <span>Débloquer (19 000 F)</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Offre 2 : Discord VIP Server */}
                    <div
                      className={`rounded-2xl border p-6 space-y-4 relative flex flex-col justify-between transition-all ${
                        hasDiscordAccess
                          ? "border-emerald-500/40 bg-[#12141c] shadow-lg shadow-emerald-500/5"
                          : "border-white/[0.08] bg-[#111318] hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="size-10 rounded-xl bg-[#5865F2]/15 text-[#5865F2] flex items-center justify-center shrink-0">
                          <DiscordIcon className="size-5" />
                        </div>
                        {hasDiscordAccess ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Check className="size-3" />
                            <span>Inclus & Actif</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Lock className="size-2.5" />
                            <span>Non souscrit</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-mono text-zinc-400">Communauté & Salons Vocaux</div>
                        <h4 className="text-base font-bold text-white">Pass Serveur Discord VIP</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Rejoignez le serveur Discord privé de {subscription.companyName} avec rôle VIP, salons d'échanges interactifs et sessions live vocales hebdomadaires.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-sm font-bold text-white font-mono">15 000 FCFA / mois</span>
                        {hasDiscordAccess ? (
                          <button
                            onClick={() => {
                              setActiveTab("discord");
                              setDiscordFlowStep("channels_list");
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#8c97f8] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Accéder à Discord</span>
                            <ChevronRight className="size-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setCheckoutModalOffer({
                                id: `offer-dc-${subscription.companyId}`,
                                title: `Pass Discord VIP (${subscription.companyName})`,
                                companyId: subscription.companyId,
                                companyName: subscription.companyName,
                                companyInitials: subscription.companyInitials,
                                category: "trading",
                                type: "membership",
                                priceDisplay: "15 000 FCFA / mois",
                                priceAmount: 15000,
                                currency: "XOF",
                                pricingType: "paid",
                                billingCycle: "monthly",
                                description: `Rôle VIP et accès aux salons Discord privés de ${subscription.companyName}.`,
                                imageUrl: subscription.companyBanner || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
                                includedApps: ["dashboard", "support", "discord"],
                                discordChannels: (subscription.discordChannels && subscription.discordChannels.length > 0)
                                  ? subscription.discordChannels
                                  : [
                                      {
                                        id: "dc-vip-auto",
                                        name: `${subscription.companyName} Discord`,
                                        subscribersCount: 980,
                                        tag: "VIP Community",
                                        description: "Salons vocaux et entraide.",
                                        inviteLink: "https://discord.gg/mansa-vip",
                                        role: "VIP Member",
                                      },
                                    ],
                                discordServerName: `${subscription.companyName} Discord HQ`,
                                discordInvite: "https://discord.gg/mansa-vip",
                              });
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-md shadow-[#5865F2]/20"
                          >
                            <span>Débloquer (15 000 F)</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Offre 3 : Masterclass Scalping & Order Flow */}
                    {(() => {
                      const isMasterclassUnlocked =
                        unlockedProductIds.includes(`offer-masterclass-${subscription.companyId}`) ||
                        currentIncludedApps.includes("cours");
                      return (
                        <div
                          className={`rounded-2xl border p-6 space-y-4 relative flex flex-col justify-between transition-all ${
                            isMasterclassUnlocked
                              ? "border-emerald-500/40 bg-[#12141c] shadow-lg shadow-emerald-500/5"
                              : "border-white/[0.08] bg-[#111318] hover:border-white/15"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="size-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                              <Sparkles className="size-5" />
                            </div>
                            {isMasterclassUnlocked ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Check className="size-3" />
                                <span>Acheté & Débloqué</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Lock className="size-2.5" />
                                <span>Non souscrit</span>
                              </span>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="text-xs font-mono text-zinc-400">Formation Avancée</div>
                            <h4 className="text-base font-bold text-white">Masterclass Scalping & Order Flow</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              12 heures de modules vidéo pas-à-pas, templates graphiques prêts à l'emploi et 2 sessions live de coaching individuel.
                            </p>
                          </div>

                          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                            <span className="text-sm font-bold text-white font-mono">45 000 FCFA</span>
                            {isMasterclassUnlocked ? (
                              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="size-3.5" />
                                <span>Accès Illimité</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setCheckoutModalOffer({
                                    id: `offer-masterclass-${subscription.companyId}`,
                                    title: "Masterclass Scalping & Order Flow",
                                    companyId: subscription.companyId,
                                    companyName: subscription.companyName,
                                    companyInitials: subscription.companyInitials,
                                    category: "trading",
                                    type: "course",
                                    priceDisplay: "45 000 FCFA",
                                    priceAmount: 45000,
                                    currency: "XOF",
                                    pricingType: "paid",
                                    billingCycle: "one_time",
                                    description: "12 heures de modules vidéo pas-à-pas, templates graphiques et 2 sessions live de coaching.",
                                    imageUrl: subscription.companyBanner || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
                                    includedApps: ["dashboard", "support", "cours"],
                                  });
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Débloquer l'offre
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Offre 4 : Pass Annuel All-Access VIP */}
                    {(() => {
                      const isAnnualUnlocked =
                        unlockedProductIds.includes(`offer-annuel-${subscription.companyId}`) ||
                        (hasTelegramAccess && hasDiscordAccess);
                      return (
                        <div
                          className={`rounded-2xl border p-6 space-y-4 relative flex flex-col justify-between transition-all ${
                            isAnnualUnlocked
                              ? "border-emerald-500/40 bg-[#12141c] shadow-lg shadow-emerald-500/5"
                              : "border-white/[0.08] bg-[#111318] hover:border-white/15"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="size-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                              <Sparkles className="size-5" />
                            </div>
                            {isAnnualUnlocked ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Check className="size-3" />
                                <span>Pass VIP Actif</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Lock className="size-2.5" />
                                <span>Non souscrit</span>
                              </span>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="text-xs font-mono text-zinc-400">Pack Complet Annuel</div>
                            <h4 className="text-base font-bold text-white">Pass Annuel All-Access VIP</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              12 mois d'accès illimité (2 mois offerts) : tous les signaux Telegram VIP, salons vocaux Discord et masterclasses inclus.
                            </p>
                          </div>

                          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                            <span className="text-sm font-bold text-white font-mono">250 000 FCFA / an</span>
                            {isAnnualUnlocked ? (
                              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="size-3.5" />
                                <span>Accès Illimité</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setCheckoutModalOffer({
                                    id: `offer-annuel-${subscription.companyId}`,
                                    title: "Pass Annuel All-Access VIP",
                                    companyId: subscription.companyId,
                                    companyName: subscription.companyName,
                                    companyInitials: subscription.companyInitials,
                                    category: "trading",
                                    type: "membership",
                                    priceDisplay: "250 000 FCFA / an",
                                    priceAmount: 250000,
                                    currency: "XOF",
                                    pricingType: "paid",
                                    billingCycle: "annual",
                                    description: "12 mois d'accès illimité avec tous les services VIP inclus.",
                                    imageUrl: subscription.companyBanner || "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80",
                                    includedApps: ["dashboard", "support", "telegram", "discord", "cours"],
                                  });
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition-colors cursor-pointer shadow-md shadow-amber-500/20"
                              >
                                Souscrire au Pass
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* VUE CONTENU : ONGLET AVIS */}
              {companyTab === "avis" && (
                <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl">
                  {/* Rating summary */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#111318] p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="text-center sm:text-left space-y-1">
                      <div className="text-4xl font-extrabold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
                        <span>4.9</span>
                        <Star className="size-6 text-amber-400 fill-amber-400" />
                      </div>
                      <p className="text-xs text-zinc-400">Basé sur 142 avis vérifiés de membres</p>
                    </div>
                    <div className="flex-1 w-full space-y-1.5 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="w-12">5 étoiles</span>
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="w-[92%] h-full bg-amber-400 rounded-full" />
                        </div>
                        <span className="w-8 text-right font-mono">92%</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="w-12">4 étoiles</span>
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="w-[6%] h-full bg-amber-400/80 rounded-full" />
                        </div>
                        <span className="w-8 text-right font-mono">6%</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="w-12">3 étoiles</span>
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="w-[2%] h-full bg-amber-400/50 rounded-full" />
                        </div>
                        <span className="w-8 text-right font-mono">2%</span>
                      </div>
                    </div>
                  </div>

                  {/* Individual reviews list */}
                  <div className="space-y-4">
                    {[
                      {
                        name: "Marc K.",
                        date: "Il y a 3 jours",
                        rating: 5,
                        text: "Qualité exceptionnelle des analyses et rigueur impressionnante sur la gestion de risque. Les alertes Telegram arrivent avec une réactivité parfaite.",
                        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
                      },
                      {
                        name: "Sarah T.",
                        date: "Il y a 1 semaine",
                        rating: 5,
                        text: "L'interface d'accueil est super propre et la liaison avec le bot Discord s'est faite en un clic. Excellent support réactif.",
                        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
                      },
                      {
                        name: "Ibrahim D.",
                        date: "Il y a 2 semaines",
                        rating: 5,
                        text: "Très bon accompagnement. Les synthèses hebdomadaires et les fiches PDF sont claires et directement exploitables.",
                        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
                      },
                    ].map((rev, i) => (
                      <div key={i} className="p-5 rounded-2xl border border-white/[0.08] bg-[#111318] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img src={rev.avatar} alt={rev.name} className="size-8 rounded-full object-cover" />
                            <div>
                              <div className="text-xs font-bold text-white">{rev.name}</div>
                              <div className="text-[10px] text-zinc-500">{rev.date}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: rev.rating }).map((_, starIdx) => (
                              <Star key={starIdx} className="size-3.5 text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">{rev.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: SUPPORT CHAT                                         */}
        {/* ============================================================ */}
        {activeTab === "support" && (
          <div className="p-3.5 sm:p-6 md:p-8 max-w-3xl mx-auto w-full flex flex-col h-full space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                  title="Ouvrir le menu"
                >
                  <Menu className="size-4" />
                </button>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-white">Support {subscription.companyName}</h1>
                  <p className="text-xs text-zinc-400">Assistance en direct pour vos produits et services</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-emerald-400 font-mono font-medium hidden sm:inline">En ligne</span>
              </div>
            </div>

            {/* Chat message box */}
            <div className="flex-1 rounded-2xl border border-white/10 bg-[#121316] p-4 overflow-y-auto space-y-3 min-h-[340px]">
              {supportChatList.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#0055ff] text-white rounded-br-none"
                        : "bg-[#1c1e24] text-zinc-200 border border-white/5 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 font-mono px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendSupport} className="flex gap-2">
              <input
                type="text"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Écrivez votre message à l'équipe..."
                className="flex-1 rounded-xl border border-white/10 bg-[#16171b] px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-[#0055ff] focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="size-3.5" />
                <span>Envoyer</span>
              </button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 3: TELEGRAM FLOW (Top Header + Central Content Card)     */}
        {/* ============================================================ */}
        {activeTab === "telegram" && (
          !hasTelegramAccess ? (
            <div className="flex-1 flex flex-col h-full bg-[#0a0b0e] text-zinc-100 overflow-y-auto">
              {/* Header bar */}
              <div className="w-full h-14 px-3 sm:px-6 border-b border-white/[0.08] bg-[#0c0d11] flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                    title="Ouvrir le menu"
                  >
                    <Menu className="size-4" />
                  </button>
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="size-6 flex items-center justify-center text-[#229ED9]">
                      <TelegramIcon className="size-5" />
                    </div>
                    <h1 className="text-sm font-bold text-white tracking-tight">Telegram</h1>
                  </div>
                </div>
              </div>

              {/* Paywall Screen */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-6 animate-in fade-in">
                <div className="size-20 rounded-3xl bg-[#229ED9]/15 border border-[#229ED9]/30 flex items-center justify-center text-[#229ED9] shadow-2xl shadow-[#229ED9]/10">
                  <Lock className="size-9 text-amber-400" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                    <Lock className="size-3" />
                    <span>Option VIP Telegram Non Incluse</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Canaux Telegram {subscription.companyName}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Vous avez rejoint <strong className="text-white font-medium">{subscription.companyName}</strong> avec accès à l'accueil et au support client. Pour recevoir les alertes de signaux en direct sur Telegram, activez l'option Telegram VIP.
                  </p>
                </div>

                <div className="w-full p-4 rounded-2xl bg-[#12141c] border border-white/10 text-left space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Inclus avec l'accès Telegram VIP :</div>
                  <div className="space-y-2 text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                      <span>Signaux de trading en temps réel et alertes scalping 24/7</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                      <span>Liaison bot Telegram d'onboarding sécurisé afhub</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                      <span>Accès aux replays vidéo et fiches d'analyses privées</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const existingOffer = PLATFORM_CREATOR_OFFERS.find(
                      (o) => o.companyName.toLowerCase() === subscription.companyName.toLowerCase() && o.includedApps.includes("telegram")
                    );
                    setCheckoutModalOffer(
                      existingOffer || {
                        id: `offer-tg-${subscription.companyId}`,
                        title: `${subscription.companyName} · Pass Telegram VIP Scalping`,
                        companyId: subscription.companyId,
                        companyName: subscription.companyName,
                        companyInitials: subscription.companyInitials,
                        category: "trading",
                        type: "membership",
                        priceDisplay: "19 € / mois",
                        priceAmount: 19,
                        currency: "EUR",
                        pricingType: "paid",
                        billingCycle: "monthly",
                        description: `Accès complet aux canaux Telegram VIP et signaux quotidiens de ${subscription.companyName}.`,
                        imageUrl: subscription.companyBanner || "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80",
                        includedApps: ["dashboard", "support", "telegram"],
                      }
                    );
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#229ED9] hover:bg-[#1b8bc2] active:scale-[0.99] text-white font-bold text-sm shadow-xl shadow-[#229ED9]/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <TelegramIcon className="size-4" />
                  <span>Débloquer l'accès Telegram VIP (19 € /mois)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full bg-[#0a0b0e] text-zinc-100 overflow-y-auto">
            
            {/* 1. TOP SECTION BAR */}
            <div className="w-full h-14 px-3 sm:px-6 border-b border-white/[0.08] bg-[#0c0d11] flex items-center justify-between shrink-0 select-none">
              
              {/* Left: Mobile Drawer Trigger + Back button "< Retour aux canaux" + Telegram icon + Title "Telegram" */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                  title="Ouvrir le menu"
                >
                  <Menu className="size-4" />
                </button>
                {telegramFlowStep === "claim_qr" && (
                  <button
                    onClick={() => setTelegramFlowStep("channels_list")}
                    className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer group"
                    title="Retour aux canaux"
                  >
                    <ChevronLeft className="size-4 text-zinc-400 group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
                    <span className="hidden sm:inline">Retour aux canaux</span>
                    <span className="sm:hidden">Retour</span>
                  </button>
                )}
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="size-6 flex items-center justify-center text-[#229ED9]">
                    <TelegramIcon className="size-5" />
                  </div>
                  <h1 className="text-sm font-bold text-white tracking-tight">Telegram</h1>
                </div>
              </div>

              {/* Far Right: Utility Icons (Link sharing, Members list, Notifications) */}
              <div className="flex items-center gap-2 text-zinc-400">
                {/* Link Sharing */}
                <div className="relative">
                  <button
                    onClick={handleCopyShareLink}
                    className="p-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                    title="Partager le lien d'accès"
                  >
                    <Share2 className="size-4" />
                  </button>
                  {copiedShareToast && (
                    <div className="absolute right-0 top-full mt-1 px-2.5 py-1 rounded-md bg-white text-black text-[10px] font-bold whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-top-1 z-20">
                      Lien copié !
                    </div>
                  )}
                </div>

                {/* Members List */}
                <div className="relative">
                  <button
                    onClick={() => setActiveMembersTooltip(!activeMembersTooltip)}
                    className="p-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    title="Membres du hub"
                  >
                    <Users className="size-4" />
                  </button>
                  {activeMembersTooltip && (
                    <div className="absolute right-0 top-full mt-1 p-2.5 rounded-xl bg-[#16181f] border border-white/10 text-white text-[11px] whitespace-nowrap shadow-xl z-20 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        <span>{subscription.onlineMembersCount || 248} membres connectés</span>
                      </div>
                      <div className="text-zinc-400 text-[10px]">Accès membre actif {subscription.companyName}</div>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setActiveNotifTooltip(!activeNotifTooltip)}
                    className="p-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors cursor-pointer relative"
                    title="Notifications Telegram"
                  >
                    <Bell className="size-4" />
                    <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-blue-500 ring-2 ring-[#0c0d11]" />
                  </button>
                  {activeNotifTooltip && (
                    <div className="absolute right-0 top-full mt-1 p-2.5 rounded-xl bg-[#16181f] border border-white/10 text-white text-[11px] whitespace-nowrap shadow-xl z-20 space-y-1">
                      <div className="font-bold">Notifications actives</div>
                      <div className="text-zinc-400 text-[10px]">Alertes et signaux synchronisés en direct</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN CONTAINER AREA */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
              
              {/* STEP 1: CHANNELS LIST / CENTRAL CONTENT CARD */}
              {telegramFlowStep === "channels_list" && (
                <div className="w-full max-w-md mx-auto space-y-6 text-center animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Central Content Card */}
                  <div className="rounded-3xl border border-white/10 bg-[#12141a] p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-sm">
                    
                    {/* Prominent Telegram Logo at the top */}
                    <div className="flex justify-center">
                      <div className="size-20 rounded-3xl bg-gradient-to-b from-[#28A8EA] to-[#1F87CB] flex items-center justify-center text-white shadow-xl shadow-blue-500/20 p-4.5 transition-transform hover:scale-105 duration-200">
                        <TelegramIcon className="size-full text-white" />
                      </div>
                    </div>

                    {/* Title Text & Sub-link */}
                    <div className="space-y-1.5">
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                        Access your Telegram channels
                      </h1>
                      <div>
                        <button
                          onClick={() => setActiveTab("support")}
                          className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer inline-block"
                        >
                          Having issues with Telegram?
                        </button>
                      </div>
                    </div>

                    {/* Vertical List of Channel Rows */}
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] divide-y divide-white/5 overflow-hidden text-left shadow-inner">
                      {channelsList.map((channel) => (
                        <div
                          key={channel.id}
                          className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                        >
                          {/* Channel Name on the Left */}
                          <div className="min-w-0 pr-2">
                            <span className="text-xs sm:text-sm font-bold text-white truncate block">
                              {channel.name}
                            </span>
                            {channel.tag && (
                              <span className="text-[10px] text-zinc-500 font-medium">
                                {channel.tag} · {channel.subscribersCount ? `${channel.subscribersCount} abonnés` : "Accès inclus"}
                              </span>
                            )}
                          </div>

                          {/* Blue "Create invite" Button Aligned to the Right */}
                          <button
                            onClick={() => handleSelectChannelToClaim(channel)}
                            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0"
                          >
                            Create invite
                          </button>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>
              )}

              {/* STEP 2: CLAIM ACCESS & QR CODE (Modal Card) */}
              {telegramFlowStep === "claim_qr" && selectedChannel && (
                <div className="w-full max-w-md mx-auto space-y-4 sm:space-y-6 text-center animate-in fade-in zoom-in-95 duration-150 px-3 sm:px-0">
                  
                  {/* Central Modal Card */}
                  <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-[#12141a] p-5 sm:p-8 space-y-4 sm:space-y-6 shadow-2xl text-center">
                    
                    {/* Large Telegram Icon at the top of the card */}
                    <div className="flex justify-center">
                      <div className="size-16 sm:size-20 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#28A8EA] to-[#1F87CB] flex items-center justify-center text-white shadow-xl shadow-blue-500/25 p-3.5 sm:p-4.5 transition-transform hover:scale-105 duration-200">
                        <TelegramIcon className="size-full text-white" />
                      </div>
                    </div>

                    {/* Explanatory Title & Scan Instructions */}
                    <div className="space-y-1.5 sm:space-y-2 text-center">
                      <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
                        Accès à {selectedChannel.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-400 max-w-[340px] mx-auto leading-relaxed">
                        Scannez ce QR Code avec l'appareil photo de votre téléphone, ou cliquez sur le bouton ci-dessous pour récupérer votre invitation.
                      </p>
                    </div>

                    {/* QR Code Container (Compact and balanced) */}
                    <div
                      onClick={() => handleClaimTelegramInvite(selectedChannel)}
                      className="bg-white p-2.5 sm:p-3.5 rounded-2xl flex items-center justify-center mx-auto size-28 sm:size-36 md:size-40 shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all group"
                      title="Cliquer pour réclamer l'invitation directement"
                    >
                      <svg
                        className="size-full aspect-square text-black"
                        viewBox="0 0 100 100"
                        fill="currentColor"
                      >
                        <rect x="0" y="0" width="30" height="30" rx="3" fill="black" />
                        <rect x="4" y="4" width="22" height="22" rx="2" fill="white" />
                        <rect x="8" y="8" width="14" height="14" rx="1" fill="black" />

                        <rect x="70" y="0" width="30" height="30" rx="3" fill="black" />
                        <rect x="74" y="4" width="22" height="22" rx="2" fill="white" />
                        <rect x="78" y="8" width="14" height="14" rx="1" fill="black" />

                        <rect x="0" y="70" width="30" height="30" rx="3" fill="black" />
                        <rect x="4" y="74" width="22" height="22" rx="2" fill="white" />
                        <rect x="8" y="78" width="14" height="14" rx="1" fill="black" />

                        <rect x="36" y="4" width="8" height="8" fill="black" />
                        <rect x="48" y="4" width="8" height="8" fill="black" />
                        <rect x="36" y="16" width="16" height="8" fill="black" />
                        <rect x="56" y="16" width="8" height="14" fill="black" />

                        <rect x="4" y="36" width="8" height="14" fill="black" />
                        <rect x="16" y="36" width="14" height="8" fill="black" />
                        <rect x="36" y="40" width="28" height="20" rx="2" fill="black" />
                        <rect x="40" y="44" width="20" height="12" fill="white" />
                        <rect x="44" y="48" width="12" height="4" fill="black" />

                        <rect x="70" y="36" width="8" height="8" fill="black" />
                        <rect x="84" y="36" width="12" height="8" fill="black" />
                        <rect x="70" y="60" width="8" height="14" fill="black" />
                        <rect x="36" y="66" width="8" height="8" fill="black" />
                        <rect x="48" y="66" width="14" height="14" fill="black" />
                        <rect x="70" y="78" width="14" height="8" fill="black" />
                        <rect x="88" y="78" width="8" height="14" fill="black" />
                      </svg>
                    </div>

                    {/* Main Action Button labeled "Réclamer l'invitation" acting as direct invite link */}
                    <div className="space-y-3 pt-1">
                      <button
                        onClick={() => handleClaimTelegramInvite(selectedChannel)}
                        className="w-full min-h-[46px] py-3 sm:py-3.5 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:brightness-105 active:scale-[0.99]"
                      >
                        <ExternalLink className="size-4" />
                        <span>Réclamer l'invitation</span>
                      </button>

                      {claimToast && (
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-center gap-2 animate-in fade-in">
                          <Check className="size-4" />
                          <span>Lien Telegram ouvert dans un nouvel onglet !</span>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              )}

              {/* STEP 3: TELEGRAM GATEWAY */}
              {telegramFlowStep === "telegram_gateway" && selectedChannel && (
                <div className="w-full max-w-md mx-auto space-y-6 text-center animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Back Navigation Bar */}
                  <div className="flex items-center justify-start text-xs text-zinc-400 px-1">
                    <button
                      onClick={() => setTelegramFlowStep("claim_qr")}
                      className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="size-4" />
                      <span>Back to QR code</span>
                    </button>
                  </div>

                  {/* Gateway Card */}
                  <div className="rounded-3xl border border-white/10 bg-[#12141a] p-6 sm:p-8 space-y-6 text-center shadow-2xl">
                    
                    <div className="size-16 rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-900 to-black border border-white/15 flex items-center justify-center text-white font-bold text-lg mx-auto shadow-inner">
                      {selectedChannel.avatarUrl ? (
                        <img src={selectedChannel.avatarUrl} alt={selectedChannel.name} className="size-full object-cover rounded-2xl" />
                      ) : (
                        <span>{subscription.companyInitials || subscription.companyName.substring(0, 2).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-white">{selectedChannel.name}</h2>
                      {selectedChannel.description && (
                        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                          {selectedChannel.description}
                        </p>
                      )}
                    </div>

                    {/* Link Box */}
                    {selectedChannel.inviteLink && (
                      <div className="p-3 rounded-xl bg-[#0c0d12] border border-white/5 flex items-center justify-between gap-3 text-left">
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] text-zinc-500 font-mono uppercase">Unique invite link</div>
                          <div className="text-xs font-mono text-zinc-300 truncate">{selectedChannel.inviteLink}</div>
                        </div>
                        <button
                          onClick={handleCopyLink}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        >
                          {copiedLink ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5 text-zinc-400" />}
                          <span>{copiedLink ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-2 space-y-2">
                      <button
                        onClick={handleOpenTelegram}
                        className="w-full py-3.5 rounded-xl bg-[#229ED9] hover:bg-[#1d8bc0] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/20"
                      >
                        <TelegramIcon className="size-4" />
                        <span>Join Channel on Telegram</span>
                      </button>
                      <p className="text-[11px] text-zinc-500">
                        You are invited to join <strong>{selectedChannel.name}</strong>.
                      </p>
                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>
          )
        )}

        {/* ============================================================ */}
        {/* VIEW 4: DISCORD FLOW (Top Header + Central Content Card)       */}
        {/* ============================================================ */}
        {activeTab === "discord" && (
          !hasDiscordAccess ? (
            <div className="flex-1 flex flex-col h-full bg-[#0a0b0e] text-zinc-100 overflow-y-auto">
              {/* Section bar */}
              <div className="w-full h-14 px-3 sm:px-6 border-b border-white/[0.08] bg-[#0c0d11] flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                    title="Ouvrir le menu"
                  >
                    <Menu className="size-4" />
                  </button>
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="size-6 flex items-center justify-center text-[#5865F2]">
                      <DiscordIcon className="size-5" />
                    </div>
                    <h1 className="text-sm font-bold text-white tracking-tight">Discord</h1>
                  </div>
                </div>
              </div>

              {/* Paywall Screen */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-6 animate-in fade-in">
                <div className="size-20 rounded-3xl bg-[#5865F2]/15 border border-[#5865F2]/30 flex items-center justify-center text-[#5865F2] shadow-2xl shadow-[#5865F2]/10">
                  <Lock className="size-9 text-amber-400" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                    <Lock className="size-3" />
                    <span>Option VIP Discord Non Incluse</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Serveur Discord {subscription.companyName}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    L'accès aux salons vocaux quotidiens, analyses de graphiques et au serveur Discord officiel nécessite l'activation de l'option VIP Discord.
                  </p>
                </div>

                <div className="w-full p-4 rounded-2xl bg-[#12141c] border border-white/10 text-left space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">Inclus avec l'accès Discord VIP :</div>
                  <div className="space-y-2 text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                      <span>Salons vocaux Live Trading Londres & New York</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                      <span>Attribution automatique du rôle vérifié Discord</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                      <span>Revues d'écrans hebdomadaires et questions/réponses</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const existingOffer = PLATFORM_CREATOR_OFFERS.find(
                      (o) => o.companyName.toLowerCase() === subscription.companyName.toLowerCase() && o.includedApps.includes("discord")
                    );
                    setCheckoutModalOffer(
                      existingOffer || {
                        id: `offer-dc-${subscription.companyId}`,
                        title: `${subscription.companyName} · Pass Discord VIP Voice & Chat`,
                        companyId: subscription.companyId,
                        companyName: subscription.companyName,
                        companyInitials: subscription.companyInitials,
                        category: "trading",
                        type: "membership",
                        priceDisplay: "29 € / mois",
                        priceAmount: 29,
                        currency: "EUR",
                        pricingType: "paid",
                        billingCycle: "monthly",
                        description: `Accès complet aux salons vocaux Discord et analyses en direct de ${subscription.companyName}.`,
                        imageUrl: subscription.companyBanner || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
                        includedApps: ["dashboard", "support", "discord"],
                      }
                    );
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#5865F2] hover:bg-[#4752c4] active:scale-[0.99] text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <DiscordIcon className="size-4" />
                  <span>Débloquer l'accès Discord VIP (29 € /mois)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full bg-[#0a0b0e] text-zinc-100 overflow-y-auto">
            
            {/* 1. TOP SECTION BAR */}
            <div className="w-full h-14 px-6 border-b border-white/[0.08] bg-[#0c0d11] flex items-center justify-between shrink-0 select-none">
              
              {/* Left: Back button "< Retour aux canaux" + Discord icon + Title "Discord" */}
              <div className="flex items-center gap-3">
                {discordFlowStep === "claim_qr" && (
                  <button
                    onClick={() => setDiscordFlowStep("channels_list")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer group"
                    title="Retour aux canaux"
                  >
                    <ChevronLeft className="size-4 text-zinc-400 group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
                    <span>Retour aux canaux</span>
                  </button>
                )}
                <div className="flex items-center gap-2.5">
                  <div className="size-6 flex items-center justify-center text-[#5865F2]">
                    <DiscordIcon className="size-5" />
                  </div>
                  <h1 className="text-sm font-bold text-white tracking-tight">Discord</h1>
                </div>
              </div>

              {/* Far Right: Utility Icons (Link sharing, Members list, Notifications) */}
              <div className="flex items-center gap-2 text-zinc-400">
                {/* Link Sharing */}
                <div className="relative">
                  <button
                    onClick={handleCopyDiscordShareLink}
                    className="p-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                    title="Share Discord invite link"
                  >
                    <Share2 className="size-4" />
                  </button>
                  {copiedDiscordShareToast && (
                    <div className="absolute right-0 top-full mt-1 px-2.5 py-1 rounded-md bg-white text-black text-[10px] font-bold whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-top-1 z-20">
                      Link copied!
                    </div>
                  )}
                </div>

                {/* Members List */}
                <div className="relative">
                  <button
                    onClick={() => setActiveDiscordMembersTooltip(!activeDiscordMembersTooltip)}
                    className="p-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    title="Hub members online"
                  >
                    <Users className="size-4" />
                  </button>
                  {activeDiscordMembersTooltip && (
                    <div className="absolute right-0 top-full mt-1 p-2.5 rounded-xl bg-[#16181f] border border-white/10 text-white text-[11px] whitespace-nowrap shadow-xl z-20 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        <span>{subscription.onlineMembersCount || 312} members online</span>
                      </div>
                      <div className="text-zinc-400 text-[10px]">Verified {subscription.companyName} role included</div>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setActiveDiscordNotifTooltip(!activeDiscordNotifTooltip)}
                    className="p-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors cursor-pointer relative"
                    title="Discord notifications"
                  >
                    <Bell className="size-4" />
                    <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[#5865F2] ring-2 ring-[#0c0d11]" />
                  </button>
                  {activeDiscordNotifTooltip && (
                    <div className="absolute right-0 top-full mt-1 p-2.5 rounded-xl bg-[#16181f] border border-white/10 text-white text-[11px] whitespace-nowrap shadow-xl z-20 space-y-1">
                      <div className="font-bold">Discord sync active</div>
                      <div className="text-zinc-400 text-[10px]">Auto-assigned roles and notifications ready</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN CONTAINER AREA */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
              
              {/* STEP 1: CHANNELS LIST / CENTRAL CONTENT CARD */}
              {discordFlowStep === "channels_list" && (
                <div className="w-full max-w-md mx-auto space-y-6 text-center animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Central Content Card */}
                  <div className="rounded-3xl border border-white/10 bg-[#12141a] p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-sm">
                    
                    {/* Prominent Discord Logo at the top */}
                    <div className="flex justify-center">
                      <div className="size-20 rounded-3xl bg-gradient-to-b from-[#5865F2] to-[#4752c4] flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 p-4.5 transition-transform hover:scale-105 duration-200">
                        <DiscordIcon className="size-full text-white" />
                      </div>
                    </div>

                    {/* Title Text & Sub-link */}
                    <div className="space-y-1.5">
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                        Access your Discord channels
                      </h1>
                      <div>
                        <button
                          onClick={() => setActiveTab("support")}
                          className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer inline-block"
                        >
                          Having issues with Discord?
                        </button>
                      </div>
                    </div>

                    {/* Vertical List of Channel Rows */}
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] divide-y divide-white/5 overflow-hidden text-left shadow-inner">
                      {discordChannelsList.map((channel) => (
                        <div
                          key={channel.id}
                          className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                        >
                          {/* Channel Name on the Left */}
                          <div className="min-w-0 pr-2">
                            <span className="text-xs sm:text-sm font-bold text-white truncate block">
                              {channel.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              {channel.role && (
                                <span className="text-[10px] text-purple-400 font-medium">
                                  👑 {channel.role}
                                </span>
                              )}
                              {channel.subscribersCount && (
                                <span className="text-[10px] text-zinc-500 font-medium">
                                  · {channel.subscribersCount} members
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Blue / Discord "Create invite" Button Aligned to the Right */}
                          <button
                            onClick={() => handleSelectDiscordToClaim(channel)}
                            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0"
                          >
                            Create invite
                          </button>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>
              )}

              {/* STEP 2: CLAIM ACCESS & QR CODE (Modal Card) */}
              {discordFlowStep === "claim_qr" && selectedDiscordChannel && (
                <div className="w-full max-w-md mx-auto space-y-6 text-center animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Central Modal Card */}
                  <div className="rounded-3xl border border-white/10 bg-[#12141a] p-6 sm:p-8 space-y-6 shadow-2xl text-center">
                    
                    {/* Large Discord Icon at the top of the card */}
                    <div className="flex justify-center">
                      <div className="size-20 rounded-3xl bg-gradient-to-b from-[#5865F2] to-[#4752c4] flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 p-4.5 transition-transform hover:scale-105 duration-200">
                        <DiscordIcon className="size-full text-white" />
                      </div>
                    </div>

                    {/* Explanatory Title & Scan Instructions */}
                    <div className="space-y-2 text-center">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                        Accès à {selectedDiscordChannel.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-400 max-w-[340px] mx-auto leading-relaxed">
                        Scannez ce QR Code avec l'appareil photo de votre téléphone, ou cliquez sur le bouton ci-dessous pour récupérer votre invitation.
                      </p>
                    </div>

                    {/* QR Code Container (Compact and balanced) */}
                    <div
                      onClick={() => handleClaimDiscordInvite(selectedDiscordChannel)}
                      className="bg-white p-3 sm:p-3.5 rounded-2xl flex items-center justify-center mx-auto size-36 sm:size-40 shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all group"
                      title="Cliquer pour réclamer l'invitation directement"
                    >
                      <svg
                        className="size-full aspect-square text-black"
                        viewBox="0 0 100 100"
                        fill="currentColor"
                      >
                        <rect x="0" y="0" width="30" height="30" rx="3" fill="black" />
                        <rect x="4" y="4" width="22" height="22" rx="2" fill="white" />
                        <rect x="8" y="8" width="14" height="14" rx="1" fill="black" />

                        <rect x="70" y="0" width="30" height="30" rx="3" fill="black" />
                        <rect x="74" y="4" width="22" height="22" rx="2" fill="white" />
                        <rect x="78" y="8" width="14" height="14" rx="1" fill="black" />

                        <rect x="0" y="70" width="30" height="30" rx="3" fill="black" />
                        <rect x="4" y="74" width="22" height="22" rx="2" fill="white" />
                        <rect x="8" y="78" width="14" height="14" rx="1" fill="black" />

                        <rect x="36" y="4" width="8" height="8" fill="black" />
                        <rect x="48" y="4" width="8" height="8" fill="black" />
                        <rect x="36" y="16" width="16" height="8" fill="black" />
                        <rect x="56" y="16" width="8" height="14" fill="black" />

                        <rect x="4" y="36" width="8" height="14" fill="black" />
                        <rect x="16" y="36" width="14" height="8" fill="black" />
                        <rect x="36" y="40" width="28" height="20" rx="2" fill="black" />
                        <rect x="40" y="44" width="20" height="12" fill="white" />
                        <rect x="44" y="48" width="12" height="4" fill="black" />

                        <rect x="70" y="36" width="8" height="8" fill="black" />
                        <rect x="84" y="36" width="12" height="8" fill="black" />
                        <rect x="70" y="60" width="8" height="14" fill="black" />
                        <rect x="36" y="66" width="8" height="8" fill="black" />
                        <rect x="48" y="66" width="14" height="14" fill="black" />
                        <rect x="70" y="78" width="14" height="8" fill="black" />
                        <rect x="88" y="78" width="8" height="14" fill="black" />
                      </svg>
                    </div>

                    {/* Main Action Button labeled "Réclamer l'invitation" acting as direct invite link */}
                    <div className="space-y-3 pt-1">
                      <button
                        onClick={() => handleClaimDiscordInvite(selectedDiscordChannel)}
                        className="w-full py-3.5 px-6 rounded-xl sm:rounded-2xl bg-[#5865F2] hover:bg-[#4752c4] active:bg-[#3c45a5] text-white text-xs sm:text-sm font-bold tracking-wide flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:brightness-105 active:scale-[0.99]"
                      >
                        <ExternalLink className="size-4" />
                        <span>Réclamer l'invitation</span>
                      </button>

                      {discordClaimToast && (
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-center gap-2 animate-in fade-in">
                          <Check className="size-4" />
                          <span>Lien Discord ouvert dans un nouvel onglet !</span>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              )}

              {/* STEP 3: DISCORD GATEWAY */}
              {discordFlowStep === "discord_gateway" && selectedDiscordChannel && (
                <div className="w-full max-w-md mx-auto space-y-6 text-center animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Back Navigation Bar */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                    <button
                      onClick={() => setDiscordFlowStep("claim_qr")}
                      className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="size-4" />
                      <span>Back to QR code</span>
                    </button>
                    <span className="text-xs font-mono text-emerald-400 font-bold">Access Ready (3 / 3)</span>
                  </div>

                  {/* Gateway Card */}
                  <div className="rounded-3xl border border-white/10 bg-[#12141a] p-6 sm:p-8 space-y-6 text-center shadow-2xl">
                    
                    <div className="size-16 rounded-2xl bg-gradient-to-br from-[#5865F2] to-[#2e3470] border border-white/15 flex items-center justify-center text-white font-bold text-lg mx-auto shadow-inner">
                      {selectedDiscordChannel.avatarUrl ? (
                        <img src={selectedDiscordChannel.avatarUrl} alt={selectedDiscordChannel.name} className="size-full object-cover rounded-2xl" />
                      ) : (
                        <DiscordIcon className="size-8 text-white" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-white">{selectedDiscordChannel.name}</h2>
                      {selectedDiscordChannel.description && (
                        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                          {selectedDiscordChannel.description}
                        </p>
                      )}
                    </div>

                    {/* Member Role Badge */}
                    {selectedDiscordChannel.role && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
                        <span>Role unlocked:</span>
                        <span className="font-bold font-mono">👑 {selectedDiscordChannel.role}</span>
                      </div>
                    )}

                    {/* Link Box */}
                    {selectedDiscordChannel.inviteLink && (
                      <div className="p-3 rounded-xl bg-[#0c0d12] border border-white/5 flex items-center justify-between gap-3 text-left">
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] text-zinc-500 font-mono uppercase">Unique Discord invite</div>
                          <div className="text-xs font-mono text-zinc-300 truncate">{selectedDiscordChannel.inviteLink}</div>
                        </div>
                        <button
                          onClick={handleCopyDiscordLink}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        >
                          {copiedDiscordLink ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5 text-zinc-400" />}
                          <span>{copiedDiscordLink ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-2 space-y-2">
                      <button
                        onClick={handleOpenDiscord}
                        className="w-full py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
                      >
                        <DiscordIcon className="size-4" />
                        <span>Join Server on Discord</span>
                      </button>
                      <p className="text-[11px] text-zinc-500">
                        You are invited to join <strong>{selectedDiscordChannel.name}</strong>.
                      </p>
                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>
          )
        )}

      </div>

      {/* Checkout Modal if user clicks on locked Telegram / Discord / Product offer */}
      {checkoutModalOffer && (
        <OfferCheckoutModal
          isOpen={!!checkoutModalOffer}
          offer={checkoutModalOffer}
          onClose={() => setCheckoutModalOffer(null)}
          onPaymentSuccess={(newSub) => {
            // Update includedApps and unlockedProductIds for current enterprise
            const updatedApps = Array.from(new Set([...currentIncludedApps, ...(newSub.includedApps || [])]));
            const updatedUnlockedIds = Array.from(
              new Set([...unlockedProductIds, ...(newSub.unlockedProductIds || []), newSub.id])
            );
            setCurrentIncludedApps(updatedApps);
            setUnlockedProductIds(updatedUnlockedIds);
            setHasPaidOffer(true);
            const userKey = user?.email || "default";
            const updatedSubscription: EnterpriseSubscription = {
              ...subscription,
              hasPaidOffer: true,
              includedApps: updatedApps,
              unlockedProductIds: updatedUnlockedIds,
              productName: subscription.hasPaidOffer && subscription.productName !== newSub.productName
                ? `${subscription.productName} + ${newSub.productName}`
                : newSub.productName,
              priceDisplay: newSub.priceDisplay || subscription.priceDisplay,
              telegramChannels: (newSub.telegramChannels && newSub.telegramChannels.length > 0)
                ? newSub.telegramChannels
                : subscription.telegramChannels,
              discordChannels: (newSub.discordChannels && newSub.discordChannels.length > 0)
                ? newSub.discordChannels
                : subscription.discordChannels,
              discordInvite: newSub.discordInvite || subscription.discordInvite,
            };
            saveSubscription(userKey, updatedSubscription);
            setCheckoutModalOffer(null);
          }}
          user={user}
        />
      )}

      {/* Enterprise Branding Configuration Modal */}
      <EnterpriseBrandingModal
        isOpen={isBrandingModalOpen}
        onClose={() => setIsBrandingModalOpen(false)}
        company={{
          id: currentSub.companyId,
          name: currentSub.companyName,
          description: currentSub.productName,
          companyBanner: currentSub.companyBanner,
          companyLogo: currentSub.companyLogo,
        }}
        onSave={handleSaveBranding}
        lang={lang}
      />
    </div>
  );
};

