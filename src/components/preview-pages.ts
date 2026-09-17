import { HomePage } from "./home-page";
import { RatesPage } from "./rates-page";
import { RulesPage } from "./rules-page";

/** The one list of previewable pages, shared by the editor and /admin/preview. */
export const previewPages = {
  home: HomePage,
  rates: RatesPage,
  rules: RulesPage,
};
export type PreviewPage = keyof typeof previewPages;
export const isPreviewPage = (
  value: string | undefined,
): value is PreviewPage => value !== undefined && value in previewPages;
