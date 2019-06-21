/// <reference types="react-scripts" />

declare module "babel-plugin-relay/macro" {
  export {graphql} from "react-relay";
}

declare module "emoji-js" {
  interface ImageSet {
    path: string;
    sheet: string;
  }

  interface ImageSets {
    apple: ImageSet;
    google: ImageSet;
    twitter: ImageSet;
    emojione: ImageSet;
    facebook: ImageSet;
    messenger: ImageSet;
  }

  interface Alias {
    [originalName: string]: string;
  }

  type ReplaceMode = "img" | "softbank" | "unified" | "google" | "css";

  export default class EmojiConverter {
    replace_emoticons(input: string): string;
    replace_emoticons_with_colons(input: string): string;
    replace_colons(input: string): string;
    replace_unified(input: string): string;
    addAliases(nameMap: Alias[]);
    removeAliases(names: string[]);

    img_set: keyof ImageSets;
    use_css_imgs: boolean;
    text_mode: boolean;
    colons_mode: boolean;
    include_title: boolean;
    include_text: boolean;
    allow_native: boolean;
    wrap_native: boolean;
    use_sheet: boolean;
    avoid_ms_emoji: boolean;
    allow_caps: boolean;
    img_suffix: string;
    replace_mode: ReplaceMode;

    img_sets: ImageSets;
  }
}
