
				// blue       green       yellow     orange    red        purple      grey
	const colArr = ["green", "yellow", "orange", "red", "blue", "purple", "grey"],
	      goalTimeArr = [[900, "15m"], [1800, "30m"], [2700, "45m"], [3600, "1hr"],
						 [4500, "1hr 15m"], [5400, "1hr 30m"], [6300, "1hr 45m"], [7200, "2hr"],
						 [8100, "2hr 15m"], [9000, "2hr 30m"], [9900, "2hr 45m"], [10800, "3hr"]];

	var headingDate = () => {
		document.getElementById("heading").innerText = Date().substring(0,10);
	}


	var Timer = class Timer {
		constructor(name, time=0, task='Type task here', goal=3600) {
			this.name = name;
			this.time = time;
			this.task = task;
			this.timer = null;
			this.goal = goal;
			this.col = this.colSelect(this.name.slice(1));
		}

		startPauseTimer(btn){
			if(this.timer) {
				console.log("PAUSE");
				clearInterval(this.timer);
				this.timer = null;
				btn.innerHTML = "<i class='fa fa-play fa-sm'></i>";
			}
			else {
				console.log("PLAY");
				btn.innerHTML = "<i class='fa fa-pause fa-sm'></i>";
				this.timer = setInterval(() => {
					this.time += 1;
					
					btn.parentNode.getElementsByClassName("list__task__time")[0].innerText = toHHMMSS(this.time);
					btn.parentNode.lastChild.style.width = this.progressBar();

				}, 1000);		
			}	
		}

			// Delete
		resetTimer (btn) {
			if(this.timer) clearInterval(this.timer);
			this.time = 0;
			btn.parentNode.getElementsByClassName("list__task__time")[0].innerText = "00:00";
		}
			// Update Task
		updateTask(textInp) {
			this.task = textInp.value;
		}
			// Progress Bar
		progressBar() {
			let progress = (this.time/this.goal)*100;	
			console.log(progress)
							
			if(progress <= 100) {
				return progress + "%";
			}
			else return "100%";
		}
			// Colour Select
		colSelect(name) {
			if(name >= colArr.length) name = name - colArr.length;
			return colArr[name];
		}
		
	}

	var totalProgressBar = () => {	
		progressTotal = taskArray.filter( x => x!=null).reduce((a,b) => a + b.time, 0);

		document.getElementById("total-time").innerText = toHHMMSS(progressTotal);

		for(let i=0; i<taskArray.length; i+=1) {
			if(taskArray[i] != null) {
				document.getElementsByClassName("progress-div-t" + taskArray[i].name)[0].style.width = ((taskArray[i].time/progressTotal)*100) + "%"; 
			}
		}
	}

	var totalProgressBarInterval = setInterval(totalProgressBar, 1000);

	var toHHMMSS = (secs) => {
	    let sec_num = parseInt(secs, 10)    
	    let hours   = Math.floor(sec_num / 3600) % 24
	    let minutes = Math.floor(sec_num / 60) % 60
	    let seconds = sec_num % 60    
	    return [hours,minutes,seconds]
	        .map(v => v < 10 ? "0" + v : v)
	        .filter((v,i) => v !== "00" || i > 0)
	        .join(":")
	}

	var placeOrValue = (n, t) => {
		if(n || t === "Type task here") return 'placeholder="'+ t +'"';
		else  return 'value="'+ t +'"';
	}

	var createNewTask = (isNew, num=taskArray.length) => {
		// If new add default time and name
		if(isNew) {
			taskArray[num] = new Timer("t" + num);
			window.localStorage.data = JSON.stringify(taskArray);
		}
		else  taskArray[num] = new Timer("t" + num, taskArray[num].time, taskArray[num].task, taskArray[num].goal);
		
		// List Item
		let li = document.createElement("li");
		li.className = "list__task li-" + num + " " + taskArray[num].col + " list__task--outside";
		li.innerHTML = `<div class="list__task__arrow"></div>
						<input class="list__task__input" onchange="taskArray[${num}].updateTask(this)" ${placeOrValue(isNew, taskArray[num].task)}>

						<span class="list__task__time">${toHHMMSS(taskArray[num].time)}</span>

						<select class="list__task__time__select" onchange="taskArray[${num}].goal = this.value"></select>

						<button class="btn btn--small play"   onclick="taskArray[${num}].startPauseTimer(this)"><i class="fas fa-play fa-sm"></i></button>
		                <button class="btn btn--small" onclick="taskArray[${num}].resetTimer(this)"><i class='fas fa-redo fa-sm'></i></button> 	                
		                <button class="btn btn--small" onclick="deleteTask(${num}, this)"><i class='fas fa-trash-alt fa-sm'></i></button>

		                <div class="list__task__progress-bar" style="width: ${taskArray[num].progressBar()}">
		                	<div class="list__task__progress-bar__ball"></div>
		                </div>`;

		for(let i=0; i<goalTimeArr.length; i+=1) {
			li.getElementsByClassName("list__task__time__select")[0].innerHTML += `<option value="${goalTimeArr[i][0]}">${goalTimeArr[i][1]}</option>`;
		}

		li.getElementsByClassName("list__task__time__select")[0].value = taskArray[num].goal;
		document.getElementsByClassName("list")[0].appendChild(li);

		document.getElementsByClassName("list__task__input")[num].focus();

		
		// Total Progress Div
		let div = document.createElement("div");
		div.className = "total-progress__bar__sec " + taskArray[num].col + " progress-div-t" + taskArray[num].name;
		//let att = document.createAttribute("style", "width: " + taskArray[num].progressBar() + ";");
		//div.setAttributeNode(att);
		document.getElementById("total-progress__bar").appendChild(div);	

		setTimeout(function() {
			document.getElementsByClassName("li-" + num)[0].classList.remove("list__task--outside");
		}, 5);	
	}

	// App loads up
	// Check to load Local Storage
	///////////////////////
	if(window.localStorage.getItem("data") === null || window.localStorage.getItem("data") == "[]") {
		var taskArray = [];
		createNewTask(true, 0);
	}
	else {
		taskArray = JSON.parse(localStorage.getItem('data'));
		for(let i=0; i<taskArray.length; i+=1) { // Go through task array and create each element non new
			if(taskArray[i] != null) createNewTask(false, i);
		}
	}

	
	var save = () => {
		window.localStorage.data = JSON.stringify(taskArray);
	}

	var deleteTask = (num, btn) => {
		document.getElementsByClassName("progress-div-t" + taskArray[num].name)[0].remove();
		
		clearInterval(taskArray[num].timer);
		taskArray[num].timer = null;
		taskArray.splice(num, 1, null); // Replace Timer with null

		//btn.parentNode.style.left = "-500px";
		//btn.parentNode.style.height = "0";

		btn.parentNode.className += " list__task--outside";

		setTimeout(function() {
			btn.parentNode.remove();
			save();
		}, 750);
		
	}

	var deleteEverything = () => {
		
		let lis = document.getElementsByClassName("list__task");
		let lisLen = lis.length;
		let progDivArr = document.getElementsByClassName("total-progress__bar__sec");

		for(let i=0; i<lisLen; i+=1) {
			if(taskArray[i] != null) {
				clearInterval(taskArray[i].timer);
				taskArray[i].timer = null;
			}	
			progDivArr[0].parentNode.removeChild(progDivArr[0]); // To remove HTML element the parentNode must be grabbed
			lis[0].remove();
		}
		taskArray = [];
		save();
	}

	// Event Listeners
	//////////////////
	document.addEventListener("load", headingDate, true);
	window.onbeforeunload = save;
