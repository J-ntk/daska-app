import type { Horizon, Priority } from "@/lib/types";

export interface TemplateTaskItem {
  title: string;
  dayOffset: number;
  horizon: Horizon;
  priority?: Priority;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  tasks: TemplateTaskItem[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "none",
    name: "Blank project",
    description: "Start empty, add tasks yourself",
    tasks: [],
  },
  {
    id: "sprint",
    name: "2-Week Sprint",
    description: "Standard agile sprint checklist",
    tasks: [
      { title: "Sprint planning meeting", dayOffset: 0, horizon: "daily", priority: "high" },
      { title: "Groom backlog", dayOffset: 1, horizon: "daily" },
      { title: "Mid-sprint check-in", dayOffset: 7, horizon: "weekly" },
      { title: "Sprint review demo", dayOffset: 13, horizon: "daily", priority: "high" },
      { title: "Sprint retrospective", dayOffset: 14, horizon: "daily" },
    ],
  },
  {
    id: "launch",
    name: "Product Launch Checklist",
    description: "Pre-launch to launch-day tasks",
    tasks: [
      { title: "Finalize feature scope", dayOffset: 0, horizon: "weekly", priority: "high" },
      { title: "QA pass / bug bash", dayOffset: 5, horizon: "weekly" },
      { title: "Write launch announcement", dayOffset: 7, horizon: "weekly" },
      { title: "Prepare marketing assets", dayOffset: 8, horizon: "weekly" },
      { title: "Notify support team", dayOffset: 10, horizon: "daily" },
      { title: "Launch day", dayOffset: 14, horizon: "daily", priority: "urgent" },
      { title: "Post-launch retro", dayOffset: 17, horizon: "weekly" },
    ],
  },
  {
    id: "content",
    name: "Content Calendar (4 weeks)",
    description: "Weekly content cadence",
    tasks: [
      { title: "Week 1 post", dayOffset: 3, horizon: "weekly" },
      { title: "Week 2 post", dayOffset: 10, horizon: "weekly" },
      { title: "Week 3 post", dayOffset: 17, horizon: "weekly" },
      { title: "Week 4 post", dayOffset: 24, horizon: "weekly" },
      { title: "Monthly newsletter", dayOffset: 27, horizon: "monthly" },
    ],
  },
];