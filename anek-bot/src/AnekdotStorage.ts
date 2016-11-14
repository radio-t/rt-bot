import {AnekdotData} from "./AnekdotData";
export class AnekdotStorage {

    private anekdots: AnekdotData[] = [];
    private index = 0;

    public update(anekdots: AnekdotData[]) {
        this.anekdots = anekdots;
        this.index = 0;
    }

    public getNext(): AnekdotData {
        this.index++;
        //TODO временно зациклим
        if (this.index >= this.anekdots.length) {
            this.index = 0;
        }
        return this.anekdots[this.index];
    }

    public hasNext(): boolean {
        if (this.index < this.anekdots.length) {
            return true;
        }
        return false;
    }
}