
export const getProjectId = (url: string) => new URL(url).searchParams.get('project');
