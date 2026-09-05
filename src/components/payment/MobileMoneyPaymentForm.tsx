import React, { useState, useEffect, useId, useMemo } from "react";
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Info,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import {
  AVAILABLE_DIAL_CODES,
  DIAL_CODE_CONFIGS,
  validatePhoneNumber,
  PhoneValidationResult,
  formatPhoneNumber,
  normalizePhoneNumber,
} from "../../utils/phoneValidationRules";

interface MobileMoneyPaymentFormProps {
  currency?: string;
  onValidationChange: (result: PhoneValidationResult) => void;
  defaultDialCode?: string;
  defaultOperatorId?: string;
  defaultPhoneNumber?: string;
  className?: string;
}

export const MobileMoneyPaymentForm: React.FC<MobileMoneyPaymentFormProps> = ({
  currency = "XAF",
  onValidationChange,
  defaultDialCode = "+242",
  defaultOperatorId,
  defaultPhoneNumber = "",
  className = "",
}) => {
  const dialCodeSelectId = useId();
  const phoneNumberInputId = useId();

  // Étape 1 : Indicatif téléphonique
  const [selectedDialCode, setSelectedDialCode] = useState<string>(
    DIAL_CODE_CONFIGS[defaultDialCode] ? defaultDialCode : "+242"
  );

  // Configuration courante du pays
  const currentCountryConfig = useMemo(() => {
    return DIAL_CODE_CONFIGS[selectedDialCode] || DIAL_CODE_CONFIGS["+242"];
  }, [selectedDialCode]);

  // Étape 2 : Opérateur disponible pour cet indicatif
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(() => {
    if (defaultOperatorId) {
      const match = currentCountryConfig.operators.find(
        (op) => op.id.toLowerCase() === defaultOperatorId.toLowerCase()
      );
      if (match) return match.id;
    }
    return currentCountryConfig.operators[0]?.id || "mtn";
  });

  // Quand l'indicatif change, s'assurer que l'opérateur sélectionné est bien disponible pour cet indicatif
  useEffect(() => {
    const isCurrentOpAvailable = currentCountryConfig.operators.some(
      (op) => op.id.toLowerCase() === selectedOperatorId.toLowerCase()
    );
    if (!isCurrentOpAvailable) {
      const firstAvailable = currentCountryConfig.operators[0]?.id || "";
      setSelectedOperatorId(firstAvailable);
    }
  }, [selectedDialCode, currentCountryConfig, selectedOperatorId]);

  // Étape 3 : Numéro de téléphone (sans indicatif)
  const [rawPhoneNumber, setRawPhoneNumber] = useState<string>(() => {
    return normalizePhoneNumber(defaultPhoneNumber, defaultDialCode);
  });

  // Opérateur actuellement sélectionné
  const currentOperator = useMemo(() => {
    return (
      currentCountryConfig.operators.find(
        (op) => op.id.toLowerCase() === selectedOperatorId.toLowerCase()
      ) || currentCountryConfig.operators[0]
    );
  }, [currentCountryConfig, selectedOperatorId]);

  // Étape 4 : Validation en temps réel
  const validationResult = useMemo(() => {
    if (!currentOperator) {
      return {
        isValid: false,
        status: "operator_unavailable" as const,
        dialCode: selectedDialCode,
        operatorId: selectedOperatorId,
        normalizedNumber: "",
        formattedNumber: "",
        fullInternationalNumber: "",
        errorMessage: "Opérateur non sélectionné",
      };
    }
    return validatePhoneNumber(
      selectedDialCode,
      currentOperator.id,
      rawPhoneNumber,
      currency
    );
  }, [selectedDialCode, currentOperator, rawPhoneNumber, currency]);

  // Transmettre la validation au parent à chaque changement
  useEffect(() => {
    onValidationChange(validationResult);
  }, [validationResult, onValidationChange]);

  // Gestionnaire de changement de numéro avec normalisation et masquage à la volée
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleanDigits = normalizePhoneNumber(val, selectedDialCode);
    if (currentOperator && cleanDigits.length > currentOperator.nationalLength + 2) {
      // Limiter la saisie pour éviter les débordements excessifs
      return;
    }
    setRawPhoneNumber(cleanDigits);
  };

  // Switch direct vers un opérateur suggéré (ex: l'utilisateur a tapé 05 alors qu'il était sur MTN au Congo)
  const handleSwitchToSuggested = (suggestedOpId: string) => {
    setSelectedOperatorId(suggestedOpId);
  };

  // Valeur affichée dans l'input (formatée avec espaces selon l'opérateur)
  const displayFormattedValue = useMemo(() => {
    if (!currentOperator || !rawPhoneNumber) return rawPhoneNumber;
    return formatPhoneNumber(rawPhoneNumber, currentOperator.formatGroups);
  }, [rawPhoneNumber, currentOperator]);

  return (
    <div
      id="mobile-money-payment-form"
      className={`rounded-2xl border border-white/10 bg-[#161822] p-4 sm:p-5 space-y-4 shadow-xl ${className}`}
    >
      {/* Header section avec rappel de sécurité */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Smartphone className="size-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>Paiement Mobile Money Sécurisé</span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Instantané
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Vérification automatique : Indicatif + Opérateur + Numéro
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
          <ShieldCheck className="size-3.5 text-emerald-400" />
          <span>Devise : {currency}</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ÉTAPE 1 : SÉLECTION DE L'INDICATIF TÉLÉPHONIQUE               */}
      {/* ============================================================ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor={dialCodeSelectId}
            className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5"
          >
            <span className="flex size-4 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black">
              1
            </span>
            <span>Sélectionner l'indicatif téléphonique</span>
          </label>
          <span className="text-[10px] text-zinc-400 font-mono">
            {currentCountryConfig.countryName}
          </span>
        </div>

        <div className="relative">
          <select
            id={dialCodeSelectId}
            value={selectedDialCode}
            onChange={(e) => setSelectedDialCode(e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/15 bg-[#1f2230] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all cursor-pointer pr-10"
          >
            {AVAILABLE_DIAL_CODES.map((country) => (
              <option key={country.dialCode} value={country.dialCode} className="bg-[#191b26] text-white py-1.5">
                {country.flag} {country.dialCode} — {country.countryName}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <ChevronDown className="size-4" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ÉTAPE 2 : SÉLECTION DE L'OPÉRATEUR (Uniquement ceux dispo)   */}
      {/* ============================================================ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
            <span className="flex size-4 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black">
              2
            </span>
            <span>Sélectionner l'opérateur disponible</span>
          </label>
          <span className="text-[10px] text-zinc-400">
            {currentCountryConfig.operators.length} opérateur{currentCountryConfig.operators.length > 1 ? "s" : ""} avec {selectedDialCode}
          </span>
        </div>

        {/* Boutons / Badges d'opérateurs pour cet indicatif */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {currentCountryConfig.operators.map((op) => {
            const isSelected = selectedOperatorId.toLowerCase() === op.id.toLowerCase();
            return (
              <button
                key={op.id}
                type="button"
                id={`operator-btn-${op.id}`}
                onClick={() => setSelectedOperatorId(op.id)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-amber-400/15 border-amber-400 text-white shadow-md shadow-amber-400/10"
                    : "bg-[#1b1e2a] border-white/10 text-zinc-300 hover:bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: op.brandColor || "#FFCC00" }}
                  />
                  <span>{op.name}</span>
                </div>
                {isSelected && (
                  <Check className="size-3.5 text-amber-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explication discrète sur les opérateurs non proposés */}
        <p className="text-[10px] text-zinc-500 flex items-center gap-1 pt-0.5">
          <Info className="size-3 shrink-0" />
          <span>
            Seuls les opérateurs officiels actifs pour {currentCountryConfig.countryName} ({selectedDialCode}) sont affichés.
          </span>
        </p>
      </div>

      {/* ============================================================ */}
      {/* ÉTAPE 3 : SAISIR LE NUMÉRO (Sans l'indicatif)                */}
      {/* ============================================================ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor={phoneNumberInputId}
            className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5"
          >
            <span className="flex size-4 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black">
              3
            </span>
            <span>Saisir le numéro de téléphone</span>
          </label>
          <span className="text-[10px] font-mono text-zinc-400">
            Format attendu : {currentOperator?.format || "XX XXX XX XX"}
          </span>
        </div>

        <div className="relative flex items-center">
          {/* Badge fixe de l'indicatif à gauche (non modifiable ici, pour éviter les doublons) */}
          <div className="absolute left-3 flex items-center gap-1.5 pointer-events-none select-none text-xs font-mono font-bold text-amber-400/90 border-r border-white/15 pr-2.5 py-1">
            <span>{currentCountryConfig.flag}</span>
            <span>{selectedDialCode}</span>
          </div>

          <input
            id={phoneNumberInputId}
            type="tel"
            inputMode="numeric"
            value={displayFormattedValue}
            onChange={handlePhoneChange}
            placeholder={currentOperator?.format || "06 123 45 67"}
            className={`w-full rounded-xl border bg-[#12141c] py-3 text-xs sm:text-sm font-mono text-white placeholder-zinc-600 outline-none transition-all pl-24 pr-10 ${
              validationResult.isValid
                ? "border-emerald-500/70 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 bg-emerald-500/5"
                : rawPhoneNumber.length > 0
                ? "border-red-500/70 focus:border-red-400 focus:ring-1 focus:ring-red-400/40 bg-red-500/5"
                : "border-white/15 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
            }`}
          />

          {/* Statut icône à droite */}
          <div className="absolute right-3 pointer-events-none">
            {validationResult.isValid ? (
              <CheckCircle2 className="size-4 text-emerald-400 animate-in zoom-in-50 duration-150" />
            ) : rawPhoneNumber.length > 0 ? (
              <AlertCircle className="size-4 text-red-400 animate-in zoom-in-50 duration-150" />
            ) : null}
          </div>
        </div>

        {/* Compteur de chiffres saisis */}
        {currentOperator && (
          <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1 pt-0.5">
            <span>Saisie sans indicatif (espaces automatiques)</span>
            <span
              className={`font-mono font-bold ${
                rawPhoneNumber.length === currentOperator.nationalLength
                  ? "text-emerald-400"
                  : rawPhoneNumber.length > currentOperator.nationalLength
                  ? "text-red-400"
                  : "text-zinc-500"
              }`}
            >
              {rawPhoneNumber.length} / {currentOperator.nationalLength} chiffres
            </span>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* ÉTAPE 4 : VALIDATION AUTOMATIQUE ET FEEDBACK EN TEMPS RÉEL   */}
      {/* ============================================================ */}
      <div id="validation-feedback-box" className="pt-1">
        {/* CAS VALIDE : Numéro OK */}
        {validationResult.isValid && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 flex items-start gap-2.5 text-emerald-300 animate-in fade-in duration-200">
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <div className="font-bold flex items-center gap-1.5 text-white">
                <span>✅ Numéro {currentOperator?.name} valide</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded">
                  {validationResult.fullInternationalNumber}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 leading-tight">
                Le numéro correspond parfaitement aux séries autorisées {currentOperator?.name} ({currentCountryConfig.countryName}).
              </p>
            </div>
          </div>
        )}

        {/* CAS INVALIDE : Incompatibilité d'opérateur (ex: a tapé 05 sur MTN Congo) */}
        {!validationResult.isValid &&
          validationResult.status === "incompatible_prefix" && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 space-y-2 text-red-200 animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-white">
                    ❌ {validationResult.errorTitle}
                  </div>
                  <p className="text-[11px] text-red-200/90 leading-relaxed">
                    {validationResult.errorMessage}
                  </p>
                </div>
              </div>

              {/* Bouton d'action rapide pour basculer vers l'opérateur détecté */}
              {validationResult.suggestedOperator && (
                <div className="pt-1 border-t border-red-500/20 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-300">
                    Changer l'opérateur sélectionné :
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleSwitchToSuggested(validationResult.suggestedOperator!.id)
                    }
                    className="py-1 px-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white font-bold text-[11px] border border-red-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Sélectionner {validationResult.suggestedOperator.name}</span>
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              )}
            </div>
          )}

        {/* CAS INVALIDE : Longueur incorrecte */}
        {!validationResult.isValid &&
          validationResult.status === "invalid_length" &&
          rawPhoneNumber.length > 0 && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 flex items-start gap-2 text-amber-200 animate-in fade-in duration-200">
              <AlertCircle className="size-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-white">
                  ❌ {validationResult.errorTitle}
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  {validationResult.errorMessage}
                </p>
              </div>
            </div>
          )}

        {/* CAS INVALIDE : Devise incompatible */}
        {!validationResult.isValid &&
          validationResult.status === "incompatible_currency" && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 flex items-start gap-2 text-red-200 animate-in fade-in duration-200">
              <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-white">
                  ❌ {validationResult.errorTitle}
                </div>
                <p className="text-[11px] text-red-200/90 leading-relaxed">
                  {validationResult.errorMessage}
                </p>
              </div>
            </div>
          )}

        {/* CAS : Champ encore vide */}
        {rawPhoneNumber.length === 0 && (
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-zinc-400 flex items-center gap-2">
            <Info className="size-3.5 text-zinc-500 shrink-0" />
            <span>
              Saisissez votre numéro {currentOperator?.name} sans l'indicatif ({selectedDialCode}).
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
