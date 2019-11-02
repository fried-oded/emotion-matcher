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
        this.instructionsPanel = $("#instructionsPanel"); 
        this.endingPanel = $("#endingPanel"); 
        
        this.panels = [this.startPanel, this.taskPanel, this.instructionsPanel, this.endingPanel];
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
                document.documentElement.requestFullscreen();
                self.onStartCallbacks.forEach(f => f(subjectId))
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

class InstructionsPanel{
    constructor(){
        var self = this;
        self.startBtn = $("#startDemoBtn");

        $(document).keydown(event => {
            // BINDING KEYS TO BUTTONS
            // find keys here https://keycode.info/
            var CONT_KEY = "Enter"
            if (event.code === CONT_KEY && !self.startBtn.prop("disabled")){
                self.startBtn.click()
            }
        })
    }

    async userStartDemo(){
        var self = this;
        return new Promise(resolve => {
            self.startBtn.one('click', resolve);
        });
    }
}


class TaskPanel{
    constructor(){
        this.picsPanel = $("#picsPanel");
        this.plusPanel = $("#plusPanel");       
        this.textPanel = $("#intructionTaskPanel");       
        this.panels = [this.picsPanel, this.plusPanel, this.textPanel];
        this.showPanel(this.plusPanel)

        this.picA = $("#picA");
        this.picB = $("#picB");

        this.yesBtn = $("#taskBtnYes");
        this.noBtn  = $("#taskBtnNo");

        this.textSame = $("#textSame");
        this.textDiff = $("#textDiff");
        this.textStart = $("#textStart");
        this.textFrames = [this.textSame, this.textDiff, this.textStart]
        this.continueBtn = $("#textContinueBtn");


        $(document).keydown(event => {
            // BINDING KEYS TO BUTTONS
            // find keys here https://keycode.info/
            var YES_KEY = "KeyW"
            var NO_KEY  = "KeyP"
            var CONT_KEY = "Enter"
            if (event.code === YES_KEY && !this.yesBtn.prop("disabled")){
                this.yesBtn.click()
            }
            else if (event.code === NO_KEY && !this.noBtn.prop("disabled")){
                this.noBtn.click()
            }
            else if (event.code === CONT_KEY && !this.continueBtn.prop("disabled")){
                this.continueBtn.click()
            }
        })
    }

    showText(textFrame){
        var self = this;
        self.textFrames.forEach(f => {f.hide()});
        textFrame.show()
        self.showPanel(self.textPanel)

        return new Promise(resolve => {
            self.continueBtn.one('click', resolve);
        });
    }

    hidePanels(){
        this.panels.forEach(p => {p.hide()});
    }  
    
    showPanel(panel){
        console.debug("showing panel " + panel.attr("id"));
        this.hidePanels();
        panel.show();
    }

    getUserAnswer(correctAnswer, showFeedback){
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
                    if(showFeedback){
                        if(chosenAnswer == correctAnswer){
                            $(this).removeClass("btn-secondary").addClass("btn-success");
                            $("#correctSound")[0].play()
                        }
                        else{
                            $(this).removeClass("btn-secondary").addClass("btn-danger");
                            $("#wrongSound")[0].play()
                        }
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

    clearFeedback(){
        this.yesBtn.removeClass("btn-danger btn-success").addClass("btn-secondary");
        this.noBtn.removeClass("btn-danger btn-success").addClass("btn-secondary");
    }

    async showCentralFixation(time){
        this.clearFeedback();
        this.showPanel(this.plusPanel);
        await sleep(time);
    }

    async executeOneTrial(picSourceA, picSourceB, correctAnswer){
        this.picA.attr("src",picSourceA);
        this.picB.attr("src",picSourceB);
        
        console.debug("show central fixation");
        await this.showCentralFixation(500);

        console.debug("show image pair");
        this.showPanel(this.picsPanel);
        var userAnswerPromise = this.getUserAnswer(correctAnswer, false); //currently disabling feedback
        await sleep(750);

        console.debug("hiding images. waiting for user choice");
        this.hidePanels();
        var userResponse = await userAnswerPromise;
        var userAnswer = userResponse.chosenAnswer;
        var responseTime = userResponse.responseTime;

        console.debug("showing feedback. (user correct: " + (userAnswer == correctAnswer) + ")");
        await sleep(500);
        
        console.debug("done");
        return {
            'userAnswer': userAnswer,
            'responseTime': responseTime
        };
    }

    async executeAllTrials(trials, subjectId){
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
                'subjectId': subjectId,
                'trialNum': i,
                'picSourceA': currentTrial.picSourceA,
                'picSourceB': currentTrial.picSourceB,
                'category': currentTrial.category,
                'correctAnswer': currentTrial.correctAnswer,
                'userAnswer': trialResult.userAnswer,
                'userCorrect': trialResult.userAnswer == currentTrial.correctAnswer,
                'responseTime': trialResult.responseTime
            });

            console.debug("show central fixation for inter-trial-interval");
            await this.showCentralFixation(1750);
        }

        return results;
    }
}


//test tools
function debug(){
    $("#configPanel").show()
}

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


async function runDemo(ms, ip, tp){
    console.log("showing instructions. waiting for user")
    ms.showPanel(ms.instructionsPanel);
    await ip.userStartDemo()

    userCorrect = false

    while(! userCorrect){
        //same
        console.log("showing demo 1")
        ms.showPanel(ms.taskPanel);
        var result1 = await tp.executeOneTrial("/pics/demo/same_1.jpg", "/pics/demo/same_2.jpg", true)
        userCorrect = userCorrect || result1.userAnswer;
        await tp.showText(tp.textSame)
    
        //diff
        console.log("showing demo 2")
        var result2 = await tp.executeOneTrial("/pics/demo/diff_1.jpg", "/pics/demo/diff_2.jpg", false)
        await tp.showText(tp.textDiff)
        userCorrect = userCorrect || !result2.userAnswer;
        
        if(!userCorrect){
            console.log("user failed both demos. rerunning demo")
        }
    }    
}


$(async function(){
    var ms = new MainScreen()
    var ip = new InstructionsPanel()
    var sp = new StartPanel()
    var tp = new TaskPanel()
    

    var trials = await requestData("trials")
    console.log(trials)

    ms.showPanel(ms.startPanel);
    var subjectId = await sp.start()
    console.log("subject id: " + subjectId)

    //start demo
    await runDemo(ms, ip, tp);

    console.log("waiting to start")
    tp.clearFeedback()
    tp.continueBtn.text("התחל")
    await tp.showText(tp.textStart)
    
    console.log("starting trials");
    ms.showPanel(ms.taskPanel);
    var results = await tp.executeAllTrials(trials, subjectId)
    console.log(results);
    console.log("done trials");

    ms.showPanel(ms.endingPanel)

    $.post("results", {
        'subject': subjectId,
        'results': results
    })
});




