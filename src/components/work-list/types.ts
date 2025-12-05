import type { Work, WorkList } from "../../services/posts/type";

export type ListState = {
  loading: boolean;
};
export interface ListProps extends ListState {
  items: WorkList;
  filterItems: filterType;
  onFilter: (type: string, value: string) => void;
}
export interface ListItemProps extends ListState {
  item: Work;
}

export type filterType = {
  value: string;
  label: string;
}[];

export interface HeaderListProps {
  filters: filterType;
  onFilter: (type: string, value: string) => void;
}
