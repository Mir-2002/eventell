import type { ClassKey } from "keycloakify/login";

const input =
  "h-11 w-full min-w-0 rounded-full border border-input bg-stone-50 px-4 text-base text-ink shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-danger md:text-sm";

// Softly styling for Keycloakify's built-in pages, which render with these class hooks
export const classes: Partial<Record<ClassKey, string>> = {
  kcHtmlClass: "",
  kcBodyClass: "",
  kcFormClass: "flex flex-col",
  kcFormGroupClass: "mb-4 flex flex-col gap-2",
  kcLabelWrapperClass: "",
  kcInputWrapperClass: "flex flex-col gap-2",
  kcLabelClass: "text-sm font-medium text-ink",
  kcInputClass: input,
  kcTextareaClass: input
    .replace("h-11", "min-h-20")
    .replace("rounded-full", "rounded-3xl py-3"),
  kcInputGroup: "relative flex items-center [&>input]:pr-12",
  kcFormPasswordVisibilityButtonClass:
    "absolute right-1.5 flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-ink",
  kcFormPasswordVisibilityIconShow: "kc-icon-eye",
  kcFormPasswordVisibilityIconHide: "kc-icon-eye-off",
  kcInputErrorMessageClass: "text-xs text-danger",
  kcInputHelperTextBeforeClass: "text-xs text-muted-foreground",
  kcInputHelperTextAfterClass: "text-xs text-muted-foreground",
  kcFormSettingClass: "flex flex-col gap-4 text-sm",
  kcFormOptionsClass: "text-sm",
  kcFormOptionsWrapperClass: "text-sm",
  kcFormButtonsClass: "flex w-full flex-col gap-3",
  kcFormButtonsWrapperClass: "flex flex-col gap-3",
  kcButtonClass:
    "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  // The strong / submit action is a dark ink pill that scales up on hover
  kcButtonPrimaryClass: "bg-ink text-white shadow-soft hover:scale-105",
  kcButtonDefaultClass:
    "border border-stone-200 bg-white text-ink hover:bg-accent",
  kcButtonSecondaryClass:
    "border border-stone-200 bg-white text-ink hover:bg-accent",
  kcButtonBlockClass: "w-full",
  kcButtonLargeClass: "",
  kcCheckboxInputClass: "size-4 accent-ink",
  kcInputClassCheckbox: "flex items-center gap-2",
  kcInputClassCheckboxInput: "size-4 accent-ink",
  kcInputClassCheckboxLabel: "text-sm",
  kcCheckLabelClass: "text-sm",
  kcInputClassRadio: "flex items-center gap-2",
  kcInputClassRadioInput: "size-4 accent-ink",
  kcInputClassRadioLabel: "text-sm",
  kcContentWrapperClass: "",
  kcFormSocialAccountSectionClass:
    "mt-6 flex flex-col gap-3 text-center text-sm text-muted-foreground",
  kcFormSocialAccountListClass: "flex flex-col gap-2",
  kcFormSocialAccountListGridClass: "grid grid-cols-2 gap-2",
  kcFormSocialAccountListButtonClass:
    "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-stone-200 bg-white text-sm font-medium text-ink hover:bg-accent",
  kcFormSocialAccountGridItem: "",
  kcSelectAuthListClass: "flex flex-col gap-2",
  kcSelectAuthListItemClass:
    "flex w-full cursor-pointer items-center gap-4 rounded-3xl border border-stone-100 bg-white p-4 text-left hover:border-stone-200",
  kcSelectAuthListItemFillClass: "flex-1",
  kcSelectAuthListItemHeadingClass: "font-medium",
  kcSelectAuthListItemDescriptionClass: "text-sm text-muted-foreground",
  kcRecoveryCodesWarning: "rounded-3xl bg-danger-soft p-4 text-sm text-danger",
};
