function SD(){
	this.sdArr = [];//生成的数独数组	
	this.errorArr = [];//错误的格子。
	this.blankNum = 30;//空白格子数量 
	this.backupSdArr = [];//数独数组备份。
}

SD.prototype={
	constructor:SD,
	init:function(blankNum){
		this.createDoms();
		var beginTime = new Date().getTime();
		this.createSdArr();
		console.log("数独生成完毕，耗时："+((new Date().getTime())-beginTime)/1000+"秒！");
				this.blankNum = this.setLevel()||blankNum || this.blankNum;		
		this.drawCells();
		this.createBlank(this.blankNum);
		this.createBlankCells();
	},
	reset:function(){
		//重置程序。
		this.errorArr = [];
		$(".sdspan").removeClass('bg_red blankCell');
		var beginTime = new Date().getTime();
		this.createSdArr();
		console.log("数独生成完毕，耗时："+((new Date().getTime())-beginTime)/1000+"秒！");
		this.blankNum = this.setLevel()||this.blankNum;
		$(".sdspan[contenteditable=true]").prop('contenteditable',false);
		this.drawCells();
		this.createBlank(this.blankNum);
		this.createBlankCells();
		var img = document.getElementById('img1');
		img.src = 'images/pic13.jpg';
		var y=document.getElementById("notice");
		y.innerHTML="开始你的数独游戏吧！注意：应使每一行、每一列、每一个粗线宫（3*3）内的数字均含1-9且不重复。";
                var t = document.getElementById('1');
		var v = document.getElementById('2');
		t.style.display = 'inline-block';
		v.style.display = 'none';
		document.getElementById("ans").innerHTML="参考答案";
	},
	again:function(){
		//清除已填
		this.errorArr = [];
		$(".sdspan").removeClass('bg_red blankCell');		
		this.createBlankCells();
                var t = document.getElementById('1');
		var v = document.getElementById('2');
                t.style.display = 'inline-block';
		v.style.display = 'none';
		document.getElementById("ans").innerHTML="参考答案";
		var img = document.getElementById('img1');
		img.src = 'images/pic13.jpg';
		var y=document.getElementById("notice");
		y.innerHTML="自己做才是最有意义的，相信你一定可以！ヾ(^▽^*)))";
	},
	setLevel:function(){
		//用户输入难度。
		loop1:for(let i = 0; i < 1; i++){
                        var ran = Math.floor((Math.random()*50)+15);
			var num = prompt("请输入你期望的数独难度。你填入的数字将作为数独中空白格的个数（应为整数，且在15到64之间）：",ran); 
			if(/^\d+$/.test(num)) {
				num = parseInt(num);
				if (num>64 || num<15){
					i--;
					continue loop1;
				}
				break loop1;
			}
			i--;
			continue loop1;
		}
		return num;
	},
	createSdArr:function(){
		//生成数独数组。
		var that = this;
		try{
			this.sdArr = [];
			this.setThird(2,2);
			this.setThird(5,5);
			this.setThird(8,8);
			var allNum = [1,2,3,4,5,6,7,8,9];
			outerfor:
			for(var i=1;i<=9;i++){
				innerfor:
				for(var j=1;j<=9;j++){
					if(this.sdArr[parseInt(i+''+j)]){
						continue innerfor;
					}
					var XArr = this.getXArr(j,this.sdArr);
					var YArr = this.getYArr(i,this.sdArr);
					var thArr = this.getThArr(i,j,this.sdArr);
					var arr = getConnect(getConnect(XArr,YArr),thArr);
					var ableArr = arrMinus(allNum,arr);

					if(ableArr.length == 0){
						this.createSdArr();
						return;
						break outerfor;
					}

					var item;
					//如果生成的重复了就重新生成。
					do{
						item = ableArr[getRandom(ableArr.length)-1];
					}while(($.inArray(item, arr)>-1));

					this.sdArr[parseInt(i+''+j)] = item;
				}
			}
			this.backupSdArr = this.sdArr.slice();
		}catch(e){
			//如果因为超出浏览器的栈限制出错，就重新运行。
			that.createSdArr();
		}
	},
	getXArr:function(j,sdArr){
		//获取所在行的值。
		var arr = [];
		for(var a =1;a<=9;a++){
			if(this.sdArr[parseInt(a+""+j)]){
				arr.push(sdArr[parseInt(a+""+j)])
			}
		}
		return arr;
	},
	getYArr:function(i,sdArr){
		//获取所在列的值。
		var arr = [];
		for(var a =1;a<=9;a++){
			if(sdArr[parseInt(i+''+a)]){
				arr.push(sdArr[parseInt(i+''+a)])
			}
		}
		return arr;
	},
	getThArr:function(i,j,sdArr){
		//获取所在三宫格的值。
		var arr = [];
		var cenNum = this.getTh(i,j);
		var thIndexArr = [cenNum-11,cenNum-1,cenNum+9,cenNum-10,cenNum,cenNum+10,cenNum-9,cenNum+1,cenNum+11];
		for(var a =0;a<9;a++){
			if(sdArr[thIndexArr[a]]){
				arr.push(sdArr[thIndexArr[a]]);
			}
		}
		return arr;
	},
	getTh:function(i,j){
		//获取所在三宫格的中间位坐标。
		var cenArr = [22,52,82,25,55,85,28,58,88];
		var index = (Math.ceil(j/3)-1) * 3 +Math.ceil(i/3) -1;
		var cenNum = cenArr[index];
		return cenNum;
	},
	setThird:function(i,j){
		//为对角线上的三个三宫格随机生成。
		var numArr = [1,2,3,4,5,6,7,8,9];
		var sortedNumArr= numArr.sort(function(){return Math.random()-0.5>0?-1:1});
		var cenNum = parseInt(i+''+j);
		var thIndexArr = [cenNum-11,cenNum-1,cenNum+9,cenNum-10,cenNum,cenNum+10,cenNum-9,cenNum+1,cenNum+11];
		for(var a=0;a<9;a++){
			this.sdArr[thIndexArr[a]] = sortedNumArr[a];
		}
	},
	drawCells:function(){
		//将生成的数组填写到九宫格
		for(var j =1;j<=9;j++){
			for(var i =1;i<=9;i++){					
				$(".sdli").eq(j-1).find(".sdspan").eq(i-1).html(this.sdArr[parseInt(i+''+j)]);
			}
		}
	},
	createBlank:function(num){
		//生成指定数量的空白格子的坐标。
		var blankArr = [];
		var numArr = [1,2,3,4,5,6,7,8,9];
		var item;
		for(var a =0;a<num;a++){
			do{
				item = parseInt(numArr[getRandom(9) -1] +''+ numArr[getRandom(9) -1]);
			}while($.inArray(item, blankArr)>-1);
			blankArr.push(item);
		}
		this.blankArr = blankArr;
	},
	createBlankCells:function(){
		//在创建好的数独中去除一部分格子的值，给用户自己填写。把对应格子变成可编辑,并添加事件。
		var blankArr = this.blankArr,len = this.blankArr.length,x,y,dom;

		for(var i =0;i<len;i++){
			x = parseInt(blankArr[i]/10);
			y = blankArr[i]%10;	
			dom = $(".sdli").eq(y-1).find(".sdspan").eq(x-1);
			dom.attr('contenteditable', true).html('').addClass('blankCell');		
			this.backupSdArr[blankArr[i]] = undefined;
		}
	},
	checkRes:function(){
		//检测用户输入结果。检测前将输入加入数组。检测单个的时候将这一个的值缓存起来并从数组中删除，检测结束在赋值回去。
                var t = document.getElementById('1');
		var v = document.getElementById('2');
		t.style.display = 'inline-block';
		v.style.display = 'none';
		document.getElementById("ans").innerHTML="参考答案";
		var blankArr = this.blankArr,len = this.blankArr.length,x,y,dom,done,temp;
		this.getInputVals();
		this.errorArr.length = 0;
		for(var i =0;i<len;i++){
			x = parseInt(blankArr[i]/10);
			y = blankArr[i]%10;
			temp = this.backupSdArr[blankArr[i]];
			this.backupSdArr[blankArr[i]] = undefined;
			this.checkCell(x,y);
			this.backupSdArr[blankArr[i]] = temp;

		}
		done = this.isAllInputed();
		if(this.errorArr.length == 0 && done ){
			var img = document.getElementById('img1');
			img.src = 'images/pic15.jpg';
			var y=document.getElementById("notice");
			y.innerHTML="恭喜完成了这个数独!q(≧▽≦q)";
			$(".bg_red").removeClass('bg_red');
		}else{
			if(!done){
				var img = document.getElementById('img1');
				img.src = 'images/pic12.jpg';
				var y=document.getElementById("notice");
				y.innerHTML="还有空白格，再检查一下吧！...(*￣０￣)ノ";
			}
			this.showErrors();
		}
	},
	checkCell:function(i,j){
		//检测一个格子中输入的值，在横竖宫里是否已存在。
		var index = parseInt(i+''+j);
		var backupSdArr = this.backupSdArr;
		var XArr = this.getXArr(j,backupSdArr);
		var YArr = this.getYArr(i,backupSdArr);
		var thArr = this.getThArr(i,j,backupSdArr);
		var arr = getConnect(getConnect(XArr,YArr),thArr);			
		var val = parseInt($(".sdli").eq(j-1).find(".sdspan").eq(i-1).html());
		if($.inArray(val, arr)>-1){
			this.errorArr.push(index);
		}
	},
	getInputVals:function(){
		//将用户输入的结果添加到数组中。
		var blankArr = this.blankArr,len = this.blankArr.length,i,x,y,dom,theval;
		for(i=0;i<len;i++){
			x = parseInt(blankArr[i]/10);
			y = blankArr[i]%10;	
			dom = $(".sdli").eq(y-1).find(".sdspan").eq(x-1);
			theval = parseInt(dom.text())||undefined;
			this.backupSdArr[blankArr[i]] = theval;
		}
	},
	isAllInputed:function(){
		//检测是否全部空格都有输入。
		var blankArr = this.blankArr,len = this.blankArr.length,i,x,y,dom;
		for(i=0;i<len;i++){
			x = parseInt(blankArr[i]/10);
			y = blankArr[i]%10;	
			dom = $(".sdli").eq(y-1).find(".sdspan").eq(x-1);
			if(dom.text()==''){
				return false
			}
		}
		return true;
	},
	showErrors:function(){
		//把错误显示出来。
		var errorArr = this.errorArr,len = this.errorArr.length,x,y,dom;
		$(".bg_red").removeClass('bg_red');
		for(var i =0;i<len;i++){
			x = parseInt(errorArr[i]/10);
			y = errorArr[i]%10;	
			dom = $(".sdli").eq(y-1).find(".sdspan").eq(x-1);
			dom.addClass('bg_red');
		}
		if(len!=0){
			var img = document.getElementById('img1');
			img.src = 'images/pic11.jpg';
			var y=document.getElementById("notice");
			y.innerHTML="有错误哦，修改一下吧！(＃°Д°)";
		}
	},
	createDoms:function(){
		return;
	},
	answer:function(){
		//生成答案。
		var t = document.getElementById('1');
		var v = document.getElementById('2');
		if(t.style.display === 'none'){
			t.style.display = 'inline-block';
			v.style.display = 'none';
			document.getElementById("ans").innerHTML="参考答案";
			var img = document.getElementById('img1');
			img.src = 'images/pic13.jpg';
			var y=document.getElementById("notice");
			y.innerHTML="自己做才是最有意义的，相信你一定可以！ヾ(^▽^*)))";
		}else{
			v.style.display = 'inline-block';
			t.style.display = 'none';
			document.getElementById("ans").innerHTML="返回作答";
			var img = document.getElementById('img1');
			img.src = 'images/pic14.jpg';
			var y=document.getElementById("notice");
			y.innerHTML="不会做了吗？先看着答案填几个再返回题目尝试吧！o((>ω< ))o";
		}
		for(var j =1;j<=9;j++){
			for(var i =1;i<=9;i++){					
				$(".sdli1").eq(j-1).find(".sdspan1").eq(i-1).html(this.sdArr[parseInt(i+''+j)]);
			}
		}
	}		
}


//生成随机正整数
function getRandom(n){
	return Math.floor(Math.random()*n+1)
}

//两个简单数组的并集。
function getConnect(arr1,arr2){
	var i,len = arr1.length,resArr = arr2.slice();
	for(i=0;i<len;i++){
		if($.inArray(arr1[i], arr2)<0){
			resArr.push(arr1[i]);
		}
	}
	return resArr;
}

//两个简单数组差集，arr1为大数组
function　arrMinus(arr1,arr2){
	var resArr = [],len = arr1.length;
	for(var i=0;i<len;i++){
		if($.inArray(arr1[i], arr2)<0){
			resArr.push(arr1[i]);
		}
	}
	return resArr;
}
window.onresize = function(){
	opened();
}
window.onload = function(){
	opened();
}
function　opened(){
	height = $(window).height();//获取当前窗口高度
	width = $(window).width();//获取当前窗口宽度
	a = $("#int").height();
	document.getElementById("replace").style.height=(a+height*0.1)+"px";
	document.getElementById("replace").style.width=width+"px";
}
//屏蔽右键菜单  
document.oncontextmenu = function (event){  
    if(window.event){  
        event = window.event;  
    }try{  
        var the = event.srcElement;  
        if (!((the.tagName == "INPUT" && the.type.toLowerCase() == "text") || the.tagName == "TEXTAREA")){  
            return false;  
        }  
        return true;  
    }catch (e){  
        return false;  
    }  
}  

//屏蔽粘贴  
document.onpaste = function (event){  
    if(window.event){  
        event = window.event;  
    }try{  
        var the = event.srcElement;  
        if (!((the.tagName == "INPUT" && the.type.toLowerCase() == "text") || the.tagName == "TEXTAREA")){  
            return false;  
        }  
        return true;  
    }catch (e){  
        return false;  
    }  
}
