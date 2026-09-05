import React, { useState } from "react";
import {
  Search,
  Sparkles,
  Star,
  Users,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Filter,
  Flame,
  Zap,
  Tag,
  Lock,
  MessageSquare,
} from "lucide-react";
import { saveSubscription } from "../../utils/subscriptionsStorage";
import { EnterpriseSubscription } from "../../types";
import { TelegramIcon, DiscordIcon } from "../common/Icons";
import { OfferCheckoutModal, CreatorPlatformOffer } from "./OfferCheckoutModal";

export const PLATFORM_CREATOR_OFFERS: CreatorPlatformOffer[] = [
  {
    id: "offer-money-life-free",
    title: "Money Life · Adhésion Membre Officielle",
    companyId: "comp-money-life",
    companyName: "Money Life",
    companyInitials: "ML",
    companyGradient: "from-emerald-950 via-slate-900 to-black",
    category: "trading",
    categoryLabel: "Club Privé & Écosystème",
    type: "membership",
    priceDisplay: "0 € Gratuit",
    priceAmount: 0,
    currency: "EUR",
    pricingType: "free",
    billingCycle: "monthly",
    description:
      "Rejoignez le réseau officiel Money Life en tant que membre. Cet accès de base vous donne accès à la page d'accueil de l'entreprise, aux actualités du réseau et au chat de support client direct avec les modérateurs.",
    imageUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    includedApps: ["dashboard", "support"],
    subscribersCount: "5 420 membres",
    rating: 4.95,
    reviewsCount: 312,
    faqs: [
      {
        q: "Quels sont mes accès avec l'adhésion membre Money Life ?",
        a: "Vous avez accès complet à la page d'accueil de l'entreprise Money Life et au canal de chat de support client 24/7. Les options Telegram VIP et salons Discord VIP sont débloquées séparément.",
      },
      {
        q: "Comment activer les alertes de signaux Telegram VIP ?",
        a: "Depuis l'espace Money Life ou le catalogue d'offres, vous pouvez souscrire au Pass VIP Telegram Scalping pour débloquer automatiquement vos canaux.",
      },
    ],
  },
  {
    id: "offer-money-life-tg-vip",
    title: "Money Life · Pass VIP Telegram Scalping & Analyses",
    companyId: "comp-money-life",
    companyName: "Money Life",
    companyInitials: "ML",
    companyGradient: "from-emerald-950 via-slate-900 to-black",
    category: "trading",
    categoryLabel: "Signaux & Scalping",
    type: "membership",
    priceDisplay: "19 € / mois",
    priceAmount: 19,
    currency: "EUR",
    pricingType: "paid",
    billingCycle: "monthly",
    description:
      "Alertes en temps réel sur l'or (XAUUSD), sessions scalping New York et analyses macroéconomiques. Débloque automatiquement les canaux Telegram VIP sécurisés de Money Life.",
    imageUrl:
      "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80",
    includedApps: ["dashboard", "support", "telegram"],
    subscribersCount: "2 890 membres VIP",
    rating: 4.97,
    reviewsCount: 420,
    telegramChannels: [
      {
        id: "tg-ml-signals",
        name: "Money Life · Signaux XAUUSD & Scalp",
        subscribersCount: 2890,
        tag: "Signaux VIP",
        description: "Alertes quotidiennes, points d'entrée et gestion des stops.",
        inviteLink: "https://t.me/+MoneyLifeSignalsVIP",
      },
      {
        id: "tg-ml-chat",
        name: "Money Life · Salon Privé Membres VIP",
        subscribersCount: 1420,
        tag: "Discussion VIP",
        description: "Échanges en direct avec l'équipe de traders Money Life.",
        inviteLink: "https://t.me/+MoneyLifeVipLounge",
      },
    ],
    pricingOptions: [
      { id: "monthly", name: "Mensuel (19 € /mois)", price: 19, billing: "mois" },
      { id: "yearly", name: "Annuel (-25% : 170 € /an)", price: 170, billing: "an" },
    ],
  },
  {
    id: "offer-cadre-financier",
    title: "Financial Framework Pro & VIP Discord",
    companyId: "comp-cadre-financier",
    companyName: "Cadre financier",
    companyInitials: "FF",
    companyGradient: "from-[#0d2818] via-[#051f10] to-[#010a04]",
    category: "trading",
    categoryLabel: "Finance Institutionnelle",
    type: "membership",
    priceDisplay: "29 € / mois",
    priceAmount: 29,
    currency: "EUR",
    pricingType: "paid",
    billingCycle: "monthly",
    description:
      "La méthode de référence pour structurer son capital et négocier les marchés avec une précision institutionnelle. Accès aux canaux Telegram et au serveur exclusif Discord.",
    imageUrl:
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
    includedApps: ["dashboard", "support", "telegram", "discord"],
    subscribersCount: "3 480 membres VIP",
    rating: 4.95,
    reviewsCount: 384,
    telegramChannels: [
      {
        id: "tg-ff-setups",
        name: "Cadre financier · Setups & Signaux",
        subscribersCount: 3480,
        tag: "Setups Pro",
        description: "Analyses de marchés, carnets d'ordres et flux institutionnels.",
        inviteLink: "https://t.me/+FinancialFrameworkVIP",
      },
    ],
    discordChannels: [
      {
        id: "dc-ff-desk",
        name: "Cadre Financier Official Discord HQ",
        subscribersCount: 4200,
        tag: "Discord HQ",
        description: "Salons d'entraide, vocaux New York & Londres, revues de trades.",
        inviteLink: "https://discord.gg/financial-framework",
        role: "Cadre VIP Pro",
      },
    ],
    discordInvite: "https://discord.gg/financial-framework",
    pricingOptions: [
      { id: "monthly", name: "Abonnement Mensuel", price: 29, billing: "mois" },
      { id: "yearly", name: "Abonnement Annuel (-20%)", price: 279, billing: "an" },
    ],
  },
  {
    id: "offer-fce-africa",
    title: "Forex Elite Africa · VIP Signals Gold & Daily Scalping",
    companyId: "comp-fce-africa",
    companyName: "Forex Elite Africa",
    companyInitials: "FE",
    companyLogo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=300&q=80",
    companyGradient: "from-amber-950 via-zinc-900 to-black",
    category: "trading",
    categoryLabel: "Trading & Finance",
    type: "membership",
    priceDisplay: "25 000 FCFA / mois",
    priceAmount: 38,
    currency: "EUR",
    pricingType: "paid",
    billingCycle: "monthly",
    description:
      "La référence francophone du trading en Afrique. Analyses institutionnelles XAUUSD, live trading sessions et alertes instantanées sur Telegram VIP.",
    imageUrl:
      "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80",
    includedApps: ["dashboard", "support", "telegram"],
    subscribersCount: "14.2k membres",
    rating: 4.95,
    reviewsCount: 384,
    telegramChannels: [
      {
        id: "tg-fe-vip",
        name: "Forex Elite Africa · VIP Gold",
        subscribersCount: 14200,
        tag: "XAUUSD Signals",
        description: "Signaux haute fréquence sur le gold avec ratio risk/reward validé.",
        inviteLink: "https://t.me/+ForexEliteAfricaGold",
      },
    ],
    pricingOptions: [
      { id: "monthly", name: "Mensuel (25 000 FCFA / 38 €)", price: 38, billing: "mois" },
      { id: "yearly", name: "Annuel (-20% : 360 €)", price: 360, billing: "an" },
    ],
  },
  {
    id: "offer-alpha-bets",
    title: "Alpha Bets Club Pro · Algorithmes Data & Pronostics IA",
    companyId: "comp-alpha-bets",
    companyName: "Alpha Bets Club Pro",
    companyInitials: "AB",
    companyLogo: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80",
    companyGradient: "from-emerald-950 via-teal-900 to-black",
    category: "sports",
    categoryLabel: "Paris Sportifs & Data",
    type: "membership",
    priceDisplay: "15 000 FCFA / mois",
    priceAmount: 23,
    currency: "EUR",
    pricingType: "paid",
    billingCycle: "monthly",
    description:
      "Analyses prédictives basées sur des modèles mathématiques rigoureux. Gestion de capital stricte et alertes automatiques sur Telegram VIP et Discord.",
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    includedApps: ["dashboard", "support", "telegram", "discord"],
    subscribersCount: "21.5k membres",
    rating: 4.88,
    reviewsCount: 512,
    telegramChannels: [
      {
        id: "tg-ab-picks",
        name: "Alpha Bets · Pronostics Safe 1.80+",
        subscribersCount: 4200,
        tag: "Picks Safe",
        description: "Sélection quotidienne avec espérance de gain mathématiquement validée.",
        inviteLink: "https://t.me/+AlphaBetsPicksSafe",
      },
    ],
    discordChannels: [
      {
        id: "dc-ab-hub",
        name: "Alpha Bets Community HQ",
        subscribersCount: 3100,
        tag: "Data HQ",
        description: "Salons statistiques, bots de cotes et gestion de bankroll certifiée.",
        inviteLink: "https://discord.gg/alpha-bets-pro",
        role: "VIP Data Bettor",
      },
    ],
    discordInvite: "https://discord.gg/alpha-bets-pro",
    pricingOptions: [
      { id: "monthly", name: "Mensuel (15 000 FCFA / 23 €)", price: 23, billing: "mois" },
      { id: "yearly", name: "Annuel (-20% : 220 €)", price: 220, billing: "an" },
    ],
  },
  {
    id: "offer-bs-syndicate",
    title: "BS Syndicate · Private Mastermind & Alpha Trading",
    companyId: "comp-bs-syndicate",
    companyName: "BS Syndicate",
    companyInitials: "BS",
    companyGradient: "from-stone-900 via-neutral-900 to-black",
    category: "crypto",
    categoryLabel: "Crypto & DeFi Syndicate",
    type: "membership",
    priceDisplay: "49 € / mois",
    priceAmount: 49,
    currency: "EUR",
    pricingType: "paid",
    billingCycle: "monthly",
    description:
      "Syndicat privé d'investisseurs crypto et DeFi. Veille sur les airdrops, analyse des protocoles émergents et alertes sur Discord VIP.",
    imageUrl:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80",
    includedApps: ["dashboard", "support", "discord"],
    subscribersCount: "1 400 membres",
    rating: 4.92,
    reviewsCount: 168,
    discordChannels: [
      {
        id: "dc-bs-vip",
        name: "BS Syndicate Discord HQ",
        subscribersCount: 1400,
        tag: "Syndicate HQ",
        description: "Salons DeFi, bot de tracking whale et vocaux hebdomadaires.",
        inviteLink: "https://discord.gg/bs-syndicate",
        role: "Syndicate Member",
      },
    ],
    discordInvite: "https://discord.gg/bs-syndicate",
  },
  {
    id: "offer-devkreativ",
    title: "DevKreativ Lab · Bot Automation & Webhooks SDK",
    companyId: "comp-devkreativ",
    companyName: "DevKreativ Lab SaaS",
    companyInitials: "DK",
    companyLogo: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80",
    companyGradient: "from-blue-950 via-indigo-950 to-black",
    category: "saas",
    categoryLabel: "SaaS & Outils Développeurs",
    type: "membership",
    priceDisplay: "19 000 FCFA / mois",
    priceAmount: 29,
    currency: "EUR",
    pricingType: "paid",
    billingCycle: "monthly",
    description:
      "Outils d'automatisation pour marchands et créateurs africains. Synchronisation Wave, Orange Money et délivrance automatique d'accès Discord et Telegram.",
    imageUrl:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    includedApps: ["dashboard", "support", "discord"],
    subscribersCount: "4 200 développeurs",
    rating: 4.88,
    reviewsCount: 196,
    discordChannels: [
      {
        id: "dc-dk-hub",
        name: "DevKreativ SaaS Hub",
        subscribersCount: 880,
        tag: "Dev Community",
        description: "Entraide développeurs, snippets de code et intégrations Wave / MTN.",
        inviteLink: "https://discord.gg/devkreativ-lab",
        role: "Licensed Developer",
      },
    ],
    discordInvite: "https://discord.gg/devkreativ-lab",
  },
  {
    id: "offer-ecommerce-mastery",
    title: "E-Commerce Mastery UEMOA · Académie Sourcing & Import Chine",
    companyId: "comp-ecommerce-mastery",
    companyName: "E-Commerce Mastery UEMOA",
    companyInitials: "EM",
    companyLogo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    companyGradient: "from-purple-950 via-pink-950 to-black",
    category: "creator",
    categoryLabel: "E-Commerce & Import",
    type: "course",
    priceDisplay: "45 000 FCFA (Accès Illimité)",
    priceAmount: 69,
    currency: "EUR",
    pricingType: "paid",
    billingCycle: "one_time",
    description:
      "Guide complet d'approvisionnement et logistique pour l'Afrique de l'Ouest. Accès à la base de +80 fournisseurs vérifiés et au groupe Telegram d'entraide.",
    imageUrl:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    includedApps: ["dashboard", "support", "telegram"],
    subscribersCount: "8 900 membres",
    rating: 4.98,
    reviewsCount: 428,
    telegramChannels: [
      {
        id: "tg-em-deals",
        name: "E-Commerce · Contacts Fournisseurs Vérifiés",
        subscribersCount: 1620,
        tag: "Sourcing Usines",
        description: "Adresses, transitaires maritimes/aériens et agents en Chine testés.",
        inviteLink: "https://t.me/+EcommerceMasteryContacts",
      },
    ],
  },
];

interface DiscoverCreatorsViewProps {
  lang?: "fr" | "en";
  user?: any;
  onNavigateToEnterprise?: (subscriptionId: string) => void;
}

export const DiscoverCreatorsView: React.FC<DiscoverCreatorsViewProps> = ({
  lang = "fr",
  user,
  onNavigateToEnterprise,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOfferForCheckout, setSelectedOfferForCheckout] = useState<CreatorPlatformOffer | null>(null);

  const categories = [
    { id: "all", label: "Toutes les offres", icon: Sparkles },
    { id: "trading", label: "Trading & Finance", icon: Zap },
    { id: "sports", label: "Paris Sportifs", icon: Flame },
    { id: "crypto", label: "Crypto & Web3", icon: Star },
    { id: "saas", label: "SaaS & Logiciels", icon: Tag },
    { id: "creator", label: "E-Commerce & Formations", icon: ShoppingBag },
  ];

  const filteredOffers = PLATFORM_CREATOR_OFFERS.filter((offer) => {
    const matchesCat =
      selectedCategory === "all" || offer.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handlePaymentSuccess = (newSub: EnterpriseSubscription) => {
    const userKey = user?.uid || user?.email || "default";
    saveSubscription(userKey, newSub);
    if (onNavigateToEnterprise) {
      onNavigateToEnterprise(newSub.id);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-white select-none">
      
      {/* 1. HEADER HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#13151b] via-[#0d0e12] to-[#07080a] p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <Sparkles className="size-3.5" />
            <span>Offres Certifiées des Créateurs afhub</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Découvrez et rejoignez les meilleures entreprises
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
            Explorez les pass d'adhésion, clubs d'investisseurs, logiciels et canaux de signaux VIP publiés par les créateurs de la plateforme. Rejoignez une entreprise pour accéder à son accueil et support, et débloquez les options VIP Telegram & Discord selon vos formules.
          </p>
        </div>

        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-[#0066FF]/15 blur-3xl" />
        <div className="pointer-events-none absolute right-40 bottom-0 size-64 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* 2. SEARCH & CATEGORY FILTER BAR */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="size-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une offre, une entreprise ou un créateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#14161f] border border-white/10 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-400 transition-all font-sans"
            />
          </div>

          <div className="text-xs text-zinc-400 font-mono self-end sm:self-center">
            <span>{filteredOffers.length} offres disponibles</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white text-black font-bold shadow-lg scale-[1.02]"
                    : "bg-[#14161f] text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5"
                }`}
              >
                <Icon className={`size-3.5 ${isSelected ? "text-black" : "text-zinc-400"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. GRID OF CREATOR OFFERS */}
      {filteredOffers.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#121317] p-12 text-center space-y-3">
          <Filter className="size-8 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Aucune offre ne correspond à votre recherche</h3>
          <p className="text-xs text-zinc-400">Essayez de modifier votre mot-clé ou sélectionnez une autre catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => {
            const hasTelegram = offer.includedApps.some((a) => a.toLowerCase().includes("telegram"));
            const hasDiscord = offer.includedApps.some((a) => a.toLowerCase().includes("discord"));

            return (
              <div
                key={offer.id}
                className="rounded-3xl border border-white/10 bg-[#12141c] overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all duration-200 group shadow-xl hover:shadow-2xl"
              >
                {/* Top Image Showcase */}
                <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-transparent to-black/30" />

                  {/* Category Pill on top left */}
                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-400 border border-white/10">
                    {offer.categoryLabel || "Offre Créateur"}
                  </div>

                  {/* Rating on top right */}
                  <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-amber-400 border border-white/10 flex items-center gap-1">
                    <Star className="size-3 fill-amber-400" />
                    <span>{offer.rating || 4.9}</span>
                  </div>

                  {/* Company badge at bottom left of cover */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-black/80 border border-white/20 flex items-center justify-center font-black text-xs text-white">
                      {offer.companyLogo ? (
                        <img src={offer.companyLogo} alt={offer.companyName} className="size-full object-cover rounded-lg" />
                      ) : (
                        <span>{offer.companyInitials || offer.companyName.substring(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-white drop-shadow-md">
                      {offer.companyName}
                    </span>
                    <ShieldCheck className="size-3.5 text-blue-400" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                      {offer.title}
                    </h3>

                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 font-light">
                      {offer.description}
                    </p>
                  </div>

                  {/* Included features tags */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block">
                      Accès inclus :
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-zinc-300 flex items-center gap-1">
                        <CheckCircle2 className="size-3 text-emerald-400" />
                        <span>Accueil & Support</span>
                      </span>

                      {hasTelegram && (
                        <span className="px-2 py-0.5 rounded-md bg-[#229ED9]/15 border border-[#229ED9]/30 text-[#229ED9] flex items-center gap-1 font-semibold">
                          <TelegramIcon className="size-3" />
                          <span>Telegram VIP</span>
                        </span>
                      )}

                      {hasDiscord && (
                        <span className="px-2 py-0.5 rounded-md bg-[#5865F2]/15 border border-[#5865F2]/30 text-[#8c97f8] flex items-center gap-1 font-semibold">
                          <DiscordIcon className="size-3" />
                          <span>Discord VIP</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & CTA Button */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase font-mono">Tarif</span>
                      <span className="text-base font-black text-white font-mono">
                        {offer.priceDisplay}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedOfferForCheckout(offer)}
                      className="px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0055EE] text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>
                        {offer.pricingType === "free" ? "Rejoindre" : "Voir & Payer"}
                      </span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL PAYMENT / CHECKOUT PAGE (IDENTICAL TO CREATOR PREVIEW) */}
      {selectedOfferForCheckout && (
        <OfferCheckoutModal
          isOpen={true}
          onClose={() => setSelectedOfferForCheckout(null)}
          offer={selectedOfferForCheckout}
          user={user}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

    </div>
  );
};
