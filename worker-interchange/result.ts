export class Result {
  constructor(
    public readonly jobId: number,
    public readonly creationTime: number,
    public readonly setupDuration: number,
    public readonly computationDuration: number,
    public readonly postToWokerDuration: number,
    public readonly data: any,
  ) {}
}
