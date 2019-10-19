async function sleep(ms) {
    return new Promise(resolve => setTimeout(async function(){
        await stepByStep();
        resolve();
    }, ms));
  }

async function requestData(url, data){
    return new Promise($.get(url, data).done)
}


class MainScreen{
    constructor(){
        this.startPanel = $("#startPanel");
        this.taskPanel = $("#taskPanel");    
        
        this.panels = [this.startPanel, this.taskPanel];
        this.showPanel(this.startPanel)
    }
    
    hidePanels(){
        this.panels.forEach(p => {p.hide()});
    }  
    
    showPanel(panel){
        console.debug("showing panel " + panel.attr("id"));
        this.hidePanels();
        panel.show();
    }
}

class StartPanel{
    constructor(){
        var self = this;
        self.subjectNumTextbox = $("#subjectNumTextbox");
        self.startBtn = $("#startBtn");
        self.onStartCallbacks = [];

        self.startBtn.click(function () {
            var subjectId = self.subjectNumTextbox.val()
            if (self.validate(subjectId)){
                self.onStartCallbacks.forEach(f => f())
            }
        });
    }

    async start(){
        var self = this;
        return new Promise(resolve => {
            self.onStartCallbacks.push(resolve);
        });
    }

    validate(subjectId){
        if(subjectId){
            return true;
        }
        else{
            console.warn("subject id is empty");
            return false;
        }            
    }
}

class TaskPanel{
    constructor(){
        this.picsPanel = $("#picsPanel");
        this.plusPanel = $("#plusPanel");       
        this.panels = [this.picsPanel, this.plusPanel];
        this.showPanel(this.plusPanel)

        this.picA = $("#picA");
        this.picB = $("#picB");

        this.yesBtn = $("#taskBtnYes");
        this.noBtn  = $("#taskBtnNo");

        $(document).keydown(event => {
            // BINDING KEYS TO BUTTONS
            // find keys here https://keycode.info/
            var YES_KEY = "KeyY"
            var NO_KEY  = "KeyN"
            if (event.code === YES_KEY && !this.yesBtn.prop("disabled")){
                this.yesBtn.click()
            }
            else if (event.code === NO_KEY && !this.noBtn.prop("disabled")){
                this.noBtn.click()
            }
        })
    }

    hidePanels(){
        this.panels.forEach(p => {p.hide()});
    }  
    
    showPanel(panel){
        console.debug("showing panel " + panel.attr("id"));
        this.hidePanels();
        panel.show();
    }

    getUserAnswer(correctAnswer){
        var self = this;
        var startTs = Date.now()
        self.yesBtn.prop("disabled", false);
        self.noBtn.prop("disabled", false);

        return new Promise(resolve => {
            var isResolved = false;
            var chooseAnswer = function (event){
                if(!isResolved){
                    var chosenAnswer = event.data;
                    console.debug("answer is " + chosenAnswer);
                    isResolved = true;

                    //disable buttons
                    self.yesBtn.prop("disabled", true);
                    self.noBtn.prop("disabled", true);

                    //show feedback
                    if(chosenAnswer == correctAnswer){
                        $(this).removeClass("btn-secondary").addClass("btn-success");
                    }
                    else{
                        $(this).removeClass("btn-secondary").addClass("btn-danger");
                    }
                    
                    resolve({
                        'chosenAnswer': chosenAnswer,
                        'responseTime': Date.now() - startTs
                    });
                }
            };
            
            self.yesBtn.one("click", true, chooseAnswer);
            self.noBtn.one("click", false, chooseAnswer);
          });
    }

    async executeOneTrial(picSourceA, picSourceB, correctAnswer){
        this.picA.attr("src",picSourceA);
        this.picB.attr("src",picSourceB);
        
        console.debug("show central fixation");
        this.showPanel(this.plusPanel);
        await sleep(500);

        console.debug("show image pair");
        this.showPanel(this.picsPanel);
        var userAnswerPromise = this.getUserAnswer(correctAnswer);
        await sleep(750);

        console.debug("hiding images. waiting for user choice");
        this.hidePanels()
        var userResponse = await userAnswerPromise;
        var userAnswer = userResponse.chosenAnswer;
        var responseTime = userResponse.responseTime;

        console.debug("showing feedback. (user correct: " + (userAnswer == correctAnswer) + ")");
        //todo: feedback
        await sleep(500);
        //todo: clear feedback if needed
        this.yesBtn.removeClass("btn-danger btn-success").addClass("btn-secondary")
        this.noBtn.removeClass("btn-danger btn-success").addClass("btn-secondary")

        console.debug("show central fixation for inter-trial-interval");
        this.showPanel(this.plusPanel);
        await sleep(1750);   
        
        console.debug("done");
        return {
            'userAnswer': userAnswer,
            'responseTime': responseTime
        };
    }

    async executeAllTrials(trials){
        var self = this;
        var results = []
        for(var i = 0; i < trials.length; i++){
            console.debug("executing trial " + i)
            var currentTrial = trials[i]
            var trialResult = await self.executeOneTrial(
                currentTrial.picSourceA,
                currentTrial.picSourceB,
                currentTrial.correctAnswer
            );

            results.push({
                'trialNum': i,
                'picSourceA': currentTrial.picSourceA,
                'picSourceB': currentTrial.picSourceB,
                'courrectAnswer': currentTrial.correctAnswer,
                'userAnswer': trialResult.userAnswer,
                'responseTime': trialResult.responseTime
            });
        }

        return results;
    }
}


//test tools
function stepByStep(){
    if($("#stepByStepChk").prop('checked')){
        var self = this;
        $("#stepBtn").prop("disabled", false);

        return new Promise(resolve => {
            $("#stepBtn").one("click", function(){
                $("#stepBtn").prop("disabled", true);
                resolve();
            });
        });
    }
}


$(async function(){
    var ms = new MainScreen()
    var tp = new TaskPanel()
    var sp = new StartPanel()

    var trials = await requestData("trials")
    console.log(trials)

    ms.showPanel(ms.startPanel);
    var subjectNumber = await sp.start()
    console.log("subject number: " + subjectNumber)
    
    ms.showPanel(ms.taskPanel);
    console.log("starting trials");
    var results = await tp.executeAllTrials(trials.slice(0,3))
    console.log(results);
    console.log("done trials");

    $.post("results", {
        'subject': subjectNumber,
        'results': results
    })
});




