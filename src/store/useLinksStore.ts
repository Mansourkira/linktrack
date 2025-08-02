import { create } from "zustand";

type Link = {
  id: string;
  title: string;
  url: string;
};

type LinksState = {
  links: Link[];
  setLinks: (links: Link[]) => void;
};

export const useLinksStore = create<LinksState>((set) => ({
  links: [],
  setLinks: (links) => set({ links }),
}));
