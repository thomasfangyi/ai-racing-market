import {Component, OnInit} from '@angular/core';
import {ScriptService} from '../scripts/script.service';
import { Script } from '../scripts/script';
import { AuthService } from '../auth.service';

declare var communication: any;

@Component({
    selector: 'app-training',
    templateUrl: './training.component.html',
    styleUrls: ['./training.component.css'],
    providers: [ScriptService, AuthService]
})
export class TrainingComponent implements OnInit {
    scripts: Script[];
    selectedScript: Script;
    constructor(private trainingService: ScriptService, private auth: AuthService) {}

    ngOnInit(): void {
        if (this.auth.loggedIn()) {
            this.trainingService
                .getUserScript(this.auth.userName())
                .then((script: Script[]) => {
                    this.scripts = script.map((script) => {
                        // TODO some mapping for raw script json
                        return script;
                    });
                    console.log(this.scripts);
                });
        }
        communication.initGraphics();
    }
    onSelect(script: Script): void {
        this.selectedScript = script;
    }
    trainAi(script: Script): void {
        // TODO: clear graphics
        communication.disconnectOnSwap();
        communication.init(1337);
        communication.train(script._id);
    }
    zoomIn(): void {
        communication.zoomIn();
    }
    zoomOut(): void {
        communication.zoomOut();
    }
    switchCar(): void {
        communication.switchCar();
    }
}

