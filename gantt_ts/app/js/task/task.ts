export class Task {
    id: string;
    taskName: string;
    status: string;
    startDate: number;
    endDate: number;
    duration: number;
    color: string;
    constructor(taskName: string, status: string, startDate: number, endDate: number, color: string) {

        this.id = taskName + endDate + status;
        this.taskName = taskName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.color = color;
        this.duration = endDate - startDate;
    }
}