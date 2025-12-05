type Work = {
  time: string;
  type: string;
  id: number;
  description: string[];
  title: string;
  pendingSync: number;
  lastModified:string;
  created:string
};

type WorkList = Work[];
export type { WorkList, Work };
