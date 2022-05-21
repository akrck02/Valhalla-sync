import { Database } from "sqlite";

export class LabelData {

    /**
     * Get the week tasks for a given user
     * @param db The database connection
     * @param id The task id to search for
     * @returns The query result
     */
     public static async getUserTaskLabels(db: Database, id: string): Promise<any> {
        const SQL = "SELECT label FROM task_label WHERE taskId = ? ORDER BY label";
        const response = await db.all(SQL,id);

        const labels : any[] = [];

        for (const index in response) {
            labels.push(response[index].label)
        }

        return new Promise((r) => r(labels));
    }

     /**
     * Set a tag to a task
     * @param db The database connection
     * @param task The task 
     * @param tag The tag to be set 
     */
    public static async setLabelToTask(db : Database, task: string, tag: string){
        const SQL = "INSERT INTO task_label(taskId, label) VALUES (?,?)";
        await db.run(SQL,task,tag)
    } 
}