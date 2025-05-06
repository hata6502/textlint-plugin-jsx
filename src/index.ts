import type { TextlintPluginCreator } from "@textlint/types";
import Processor from "./JSXProcessor";

const creator: TextlintPluginCreator = {
  Processor,
};

export default creator;
