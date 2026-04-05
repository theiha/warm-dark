/**
 * Default showcase source for the Warm Dark marketplace page.
 * It is intentionally self-contained so it stays error-free in this repo.
 */

enum PreviewSurface {
  Editor = "editor",
  Sidebar = "sidebar",
  Terminal = "terminal",
  Markdown = "markdown",
}

type AccentTone = "copper" | "sand" | "sage" | "mist" | "plum";

interface ShowcaseItem {
  id: string;
  title: string;
  surface: PreviewSurface;
  accent?: AccentTone;
  hours: number;
  active: boolean;
  tags: string[];
  note: string;
  sample: string;
}

interface Recommendation {
  fontFamily: string;
  iconThemeExtension: string;
  iconThemeName: string;
  note: string;
}

interface ShowcaseBundle {
  title: string;
  summary: string;
  palette: typeof PALETTE;
  recommendations: Recommendation;
  items: ShowcaseItem[];
  markdown: string;
  htmlPreview: string;
  commandSnippet: string;
  generatedAt: string;
}

const THEME_NAME = "Warm Dark";
const VERSION = "1.0.0";
const ISSUE_PATTERN = /^WD-\d{3}$/;
const SURFACE_PATTERN = /editor|terminal|markdown|selection/gi;

const PALETTE = {
  background: "#272420",
  panel: "#1d1b18",
  line: "#2e2b28",
  border: "#3b3b3b",
  foreground: "#b5b3ae",
  muted: "#606366",
  copper: "#c07a58",
  sand: "#e4c472",
  sage: "#6f9460",
  mist: "#6da0be",
  plum: "#9e80b3",
  ember: "#e65825",
} as const;

const RECOMMENDATION: Recommendation = {
  fontFamily: "Maple Mono",
  iconThemeExtension: "wilfriedago.vscode-symbols-icon-theme",
  iconThemeName: "Symbols",
  note: "Maple Mono keeps punctuation crisp while Symbols stays calm beside the warm palette.",
};

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "WD-104",
    title: "Tune suggestion hover contrast",
    surface: PreviewSurface.Editor,
    accent: "copper",
    hours: 2.5,
    active: true,
    tags: ["selection", "hover", "editor"],
    note: "The active row should stay visible without turning the widget icy.",
    sample: "editorSuggestWidget.selectedBackground",
  },
  {
    id: "WD-118",
    title: "Preview Markdown headings on muted panels",
    surface: PreviewSurface.Markdown,
    accent: "sand",
    hours: 4,
    active: true,
    tags: ["markdown", "panel", "heading"],
    note: "Warm headings should still separate from italic links and inline code.",
    sample: "markup.heading + markup.inline.raw",
  },
  {
    id: "WD-123",
    title: "Align ANSI blue with number tokens",
    surface: PreviewSurface.Terminal,
    accent: "mist",
    hours: 3.5,
    active: true,
    tags: ["terminal", "ansi", "numbers"],
    note: "Blue needs enough clarity for numbers and booleans without overpowering strings.",
    sample: "terminal.ansiBlue / constant.numeric",
  },
  {
    id: "WD-131",
    title: "Tighten bracket glow on dark surfaces",
    surface: PreviewSurface.Editor,
    accent: "plum",
    hours: 1.5,
    active: false,
    tags: ["brackets", "glow", "match"],
    note: "A warm match glow feels better than a sharp outline on low-contrast backgrounds.",
    sample: "editorBracketMatch.background",
  },
];

function scoreItem(item: ShowcaseItem): number {
  const activeWeight = item.active ? 1.25 : 0.9;
  const surfaceWeight = item.surface === PreviewSurface.Terminal ? 1.1 : 1;
  const tagWeight = Math.max(1, item.tags.length / 2);

  return Number((item.hours * activeWeight * surfaceWeight * tagWeight).toFixed(2));
}

function formatHours(hours: number): string {
  return hours === 1 ? "1 hour" : `${hours.toFixed(1)} hours`;
}

function pickAccent(surface: PreviewSurface): AccentTone {
  switch (surface) {
    case PreviewSurface.Markdown:
      return "sand";
    case PreviewSurface.Terminal:
      return "mist";
    case PreviewSurface.Sidebar:
      return "sage";
    case PreviewSurface.Editor:
    default:
      return "copper";
  }
}

function buildMarkdown(items: ShowcaseItem[]): string {
  const lines = [
    `# ${THEME_NAME}`,
    "",
    `Version: ${VERSION}`,
    "",
    "## Recommended Pairing",
    `- Font: ${RECOMMENDATION.fontFamily}`,
    `- Icons: ${RECOMMENDATION.iconThemeExtension}`,
    "",
    "## Showcase Notes",
    ...items.map((item) => `- **${item.id}** ${item.title} -> \`${item.sample}\``),
  ];

  return lines.join("\n");
}

function buildHtmlPreview(items: ShowcaseItem[]): string {
  return [
    "<section class=\"theme-preview\" data-theme=\"warm-dark\">",
    ...items.map((item) => {
      const accent = item.accent ?? pickAccent(item.surface);

      return `  <article data-surface="${item.surface}" data-accent="${accent}" aria-live="polite">`
        + `<h2>${item.title}</h2><p>${item.note}</p><code>${item.sample}</code></article>`;
    }),
    "</section>",
  ].join("\n");
}

class ShowcaseBuilder {
  constructor(private readonly items: ShowcaseItem[]) {}

  validate(): ShowcaseItem[] {
    return this.items.filter((item) => ISSUE_PATTERN.test(item.id) && item.tags.length > 0);
  }

  summarize(validItems: ShowcaseItem[]): string {
    const activeCount = validItems.filter((item) => item.active).length;
    const totalScore = validItems.reduce((sum, item) => sum + scoreItem(item), 0);
    const highlightedSurfaces = validItems.reduce((count, item) => {
      return count + (item.note.match(SURFACE_PATTERN) ?? []).length;
    }, 0);

    return `${activeCount} active previews, ${totalScore.toFixed(1)} total score, ${highlightedSurfaces} highlighted surfaces`;
  }

  create(): ShowcaseBundle {
    const validItems = this.validate();
    const summary = this.summarize(validItems);
    const commandSnippet = JSON.stringify(
      {
        "editor.fontFamily": `${RECOMMENDATION.fontFamily}, monospace`,
        "editor.fontLigatures": true,
        "terminal.integrated.fontFamily": `${RECOMMENDATION.fontFamily}, monospace`,
      },
      null,
      2
    );

    return {
      title: `${THEME_NAME} showcase`,
      summary,
      palette: PALETTE,
      recommendations: RECOMMENDATION,
      items: validItems,
      markdown: buildMarkdown(validItems),
      htmlPreview: buildHtmlPreview(validItems),
      commandSnippet,
      generatedAt: new Date("2026-04-02T12:00:00Z").toISOString(),
    };
  }
}

export function buildDefaultShowcase(): ShowcaseBundle {
  const builder = new ShowcaseBuilder(SHOWCASE_ITEMS);
  const bundle = builder.create();

  return {
    ...bundle,
    items: bundle.items.map((item) => ({
      ...item,
      accent: item.accent ?? pickAccent(item.surface),
      note: `${item.note} Estimated polish: ${formatHours(item.hours)}.`,
    })),
  };
}

export const defaultShowcase = buildDefaultShowcase();
