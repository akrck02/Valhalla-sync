import Logger from "../lib/Logger";
import Test from "./Test";

export default abstract class TestSuite {

    protected tests : Test[];
    constructor(){this.tests = []}

    async runAll(name: string) : Promise<boolean> {

        const start = new Date().getTime();

        Logger.hardTitle("๐งช Running test suite " + name + " ๐งช");

        for(let i = 0; i < this.tests.length; i++) {
            
            const testResult = await (this.tests[i].run());

            if(!testResult) {
                Logger.softTitle("๐ก Tests terminated with a failure ๐ก");
                return false;
            }
        }

        const end = new Date().getTime();

        Logger.softTitle("๐ข All tests passed successfully ๐ข");
        Logger.rawlog("Test suite ran in " + (end-start) + "ms.\n");
        return true;        
    }

    public getTests() : Test[] {
        return this.tests;
    }
} 