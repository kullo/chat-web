export class Job {
  constructor(
    public readonly id: number,
    public readonly creationTime: number,
    public readonly method: string,
    public readonly params: any[],
  ) {}
}
