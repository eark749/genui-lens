"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface ActiveProject {
  id: string;
  name: string;
}

interface ProjectContextValue {
  project: ActiveProject | null;
  setProject: (p: ActiveProject | null) => void;
}

const ProjectContext = createContext<ProjectContextValue>({
  project: null,
  setProject: () => {},
});

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [project, setProjectState] = useState<ActiveProject | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("lens_active_project");
    if (stored) {
      try {
        setProjectState(JSON.parse(stored));
      } catch {}
    }
  }, []);

  function setProject(p: ActiveProject | null) {
    setProjectState(p);
    if (p) {
      localStorage.setItem("lens_active_project", JSON.stringify(p));
    } else {
      localStorage.removeItem("lens_active_project");
    }
  }

  return (
    <ProjectContext.Provider value={{ project, setProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}
