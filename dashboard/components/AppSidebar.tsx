"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  IconLayoutDashboard,
  IconCheckbox,
  IconMessages,
  IconComponents,
  IconActivity,
  IconMessage,
  IconBook,
  IconFolder,
  IconArrowLeft,
  IconChevronDown,
} from "@tabler/icons-react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";
import { useProject } from "@/context/ProjectContext";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Overview", href: "/dashboard", icon: <IconLayoutDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
  { label: "Tasks", href: "/tasks", icon: <IconCheckbox className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
  { label: "Conversations", href: "/conversations", icon: <IconMessages className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
  { label: "UI Elements", href: "/ui-elements", icon: <IconComponents className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
  { label: "Event Stream", href: "/event-stream", icon: <IconActivity className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
  { label: "Chat", href: "/chat", icon: <IconMessage className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
  { label: "Docs", href: "/docs", icon: <IconBook className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
];

function ProjectBadge() {
  const { open } = useSidebar();
  const { project } = useProject();
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/projects")}
      className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-[#1c1c1f] transition-colors w-full text-left"
    >
      <IconFolder className="h-5 w-5 shrink-0 text-blue-500" />
      <motion.div
        animate={{ display: open ? "flex" : "none", opacity: open ? 1 : 0 }}
        className="flex-1 min-w-0 flex items-center justify-between"
      >
        <div className="min-w-0">
          <p className="text-xs text-neutral-500 dark:text-neutral-500 leading-none mb-0.5">Project</p>
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
            {project?.name ?? "Select project"}
          </p>
        </div>
        <IconChevronDown className="h-3.5 w-3.5 text-neutral-400 shrink-0 ml-1" />
      </motion.div>
    </button>
  );
}

function UserFooter() {
  const { open } = useSidebar();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useState(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
    });
  });

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = email ? email[0].toUpperCase() : "?";

  return (
    <div className="flex items-center gap-2 px-2 py-2">
      <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
        {initials}
      </div>
      <motion.div
        animate={{ display: open ? "flex" : "none", opacity: open ? 1 : 0 }}
        className="flex-1 min-w-0 flex items-center justify-between"
      >
        <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate">{email ?? "..."}</p>
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="ml-1 text-neutral-400 hover:text-red-500 transition-colors shrink-0"
        >
          <IconArrowLeft className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  );
}

export function AppSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {/* Logo */}
          <div className="px-2 py-1 mb-4">
            {open ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-semibold text-gray-900 dark:text-zinc-100 text-sm whitespace-pre"
              >
                ⬡ GenUI Lens
              </motion.span>
            ) : (
              <span className="font-semibold text-gray-900 dark:text-zinc-100">⬡</span>
            )}
          </div>

          {/* Project selector */}
          <div className="mb-2">
            <ProjectBadge />
          </div>

          <div className="h-px bg-neutral-200 dark:bg-[#27272a] mb-4" />

          {/* Nav links */}
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <SidebarLink key={link.href} link={link} />
            ))}
          </div>
        </div>

        {/* Bottom: theme toggle + user */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 px-2 py-2">
            <ThemeToggle />
            <motion.span
              animate={{ display: open ? "inline" : "none", opacity: open ? 1 : 0 }}
              className="text-sm text-neutral-500 dark:text-neutral-500 whitespace-pre"
            >
              Toggle theme
            </motion.span>
          </div>
          <UserFooter />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
