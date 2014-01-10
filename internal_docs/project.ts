interface RefListItem {
	sortValue: number;
	ref: string;
}


interface Project {
	id: string;
	name: string;
	assets: {
		[ref:string]: RefListItem
	};
	publishedUrl?: string;
}