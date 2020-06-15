// Canvas DOM 元素 
const canvas1 = document.getElementById('user')
const ctx1 = canvas1.getContext('2d')
const canvas2 = document.getElementById('animation')
const ctx2 = canvas2.getContext('2d')

//起始點座標
let x1 = 0
let y1 = 0

// 終點座標
let x2 = 0
let y2 = 0

let points = []
let characterPostion = [400, 400]
let moves = []
let t = 0

// 宣告一個 hasTouchEvent 變數，來檢查是否有 touch 的事件存在
const hasTouchEvent = 'ontouchstart' in window ? true : false

// 透過上方的 hasTouchEvent 來決定要監聽的是 mouse 還是 touch 的事件
const downEvent = hasTouchEvent ? 'ontouchstart' : 'mousedown'
const moveEvent = hasTouchEvent ? 'ontouchmove' : 'mousemove'
const upEvent = hasTouchEvent ? 'touchend' : 'mouseup'

// 宣告 isMouseActive 為滑鼠點擊的狀態，因為我們需要滑鼠在 mousedown 的狀態時，才會監聽 mousemove 的狀態
let isMouseActive = false

canvas1.addEventListener(downEvent, function(e){
	isMouseActive = true  
	x1 = e.offsetX
	y1 = e.offsetY

	ctx1.lineWidth = 1
	ctx1.lineCap = 'round'
	ctx1.lineJoin = 'round'
})

canvas1.addEventListener(moveEvent, function(e){
	if(!isMouseActive){
		return
	}
	points.push([x1, y1])
	// 取得終點座標
	x2 = e.offsetX
	y2 = e.offsetY

	// 開始繪圖
	ctx1.beginPath()
	ctx1.moveTo(x1, y1)
	ctx1.lineTo(x2, y2)
	ctx1.stroke()

	// 更新起始點座標
	x1 = x2
	y1 = y2
})

canvas1.addEventListener(upEvent, function(e){
	isMouseActive = false
	let motions = identifyMotion()
	console.log(motions)
	let motion = motions[0]
	if(motion == 1){
		document.getElementById("motion").innerHTML = "walk"
		walk()
	}
	else if(motion == 2){
		document.getElementById("motion").innerHTML = "jump"
		jump()
	}
	else if(motion == 3){
		document.getElementById("motion").innerHTML = "front flip"
		frontFlip()
	}
	else if(motion == 4){
		document.getElementById("motion").innerHTML = "back flip"
		backFlip()
	}
	else{
		document.getElementById("motion").innerHTML = "error"
		ctx2.clearRect(0, 0, canvas2.width, canvas2.height)
		setTimeout("init()", 1000)
	}
	
})

function init() {
	cleanCanvas1()
	characterPostion = [400, 400]
	ctx2.clearRect(0, 0, canvas2.width, canvas2.height)
	drawStand(characterPostion)
}

function cleanCanvas1(){
	points = []
	moves = []
	ctx1.clearRect(0, 0, canvas1.width, canvas1.height)
	document.getElementById("motion").innerHTML = ""
}

function identifyMotion(){
	if(points.length == 0) return 0
	drawpath()
	/// detect motion
	let motions = []
	if( points.length > 0){

		// bezier curve
		let samplePoints = []
		for(let i = 0; i < moves.length; i+=4){
			samplePoints.push([(moves[i][0]-400)/10, (400-moves[i][1])/10])
		}
		while(samplePoints.length > 4 && (samplePoints.length-1) % 3 != 0){
			samplePoints.pop()
		}
		//for(let i = 0; i < samplePoints.length; i++){
		// 	console.log(samplePoints[i][0], samplePoints[i][1])
		// }
		// console.log('sample len',samplePoints.length)
		 let num = 0
		 while(num < samplePoints.length-1){
		 	let t = 333 / 1000
		 	let x = samplePoints[num][0] * (1-t)**3 + 3 * samplePoints[num+1][0] * t * (1-t)**2 + 3 * samplePoints[num+2][0] * t**2 * (1-t) + samplePoints[num+3][0] * t**3
		 	let y = samplePoints[num][1] * (1-t)**3 + 3 * samplePoints[num+1][1] * t * (1-t)**2 + 3 * samplePoints[num+2][1] * t**2 * (1-t) + samplePoints[num+3][1] * t**3
		 	let temp1 = [x, y]
			console.log('t*(1-t)',t*(1-t)**2)
		 	t = 666 / 1000
		 	x = samplePoints[num][0] * (1-t)**3 + 3 * samplePoints[num+1][0] * t * (1-t)**2 + 3 * samplePoints[num+2][0] * t**2 * (1-t) + samplePoints[num+3][0] * t**3
		 	y = samplePoints[num][1] * (1-t)**3 + 3 * samplePoints[num+1][1] * t * (1-t)**2 + 3 * samplePoints[num+2][1] * t**2 * (1-t) + samplePoints[num+3][1] * t**3
		 	let temp2 = [x, y]
			samplePoints[num+1][0] = temp1[0]
			samplePoints[num+1][1] = temp1[1]
		 	samplePoints[num+2][0] = temp2[0]
			samplePoints[num+2][1] = temp2[1]
			num = num + 3
		 }
		 console.log('bezier len',samplePoints.length)
		console.log('--')
		for(let i = 0; i < samplePoints.length; i++){
		 	console.log(samplePoints[i][0], samplePoints[i][1])
		}

		// find summit
		let summit = []
		tolerance = 0.0001
		let i = 0
		console.log('samplePoints num', samplePoints.length)
		while(i < samplePoints.length){
			// console.log(i)
			if(i == 0){
				if(Math.abs(samplePoints[i][1] - samplePoints[i+1][1]) > tolerance){
					summit.push([samplePoints[i][0], samplePoints[i][1], i])
					console.log('i == 0', [samplePoints[i][0], samplePoints[i][1], i])
				}
			}
			else if(i == samplePoints.length-1){
				if(Math.abs(samplePoints[i][1] - samplePoints[i-1][1]) > tolerance){
					summit.push([samplePoints[i][0], samplePoints[i][1], i])
					console.log('i == last', [samplePoints[i][0], samplePoints[i][1], i])
				}
			}
			else{
				if((((samplePoints[i][1] - samplePoints[i-1][1]) > tolerance && (samplePoints[i][1] - samplePoints[i+1][1]) > tolerance) ||
			   ((samplePoints[i][1] - samplePoints[i-1][1]) < -tolerance && (samplePoints[i][1] - samplePoints[i+1][1] < -tolerance)))){
				   summit.push([samplePoints[i][0], samplePoints[i][1], i])
				   console.log('peak', [samplePoints[i][0], samplePoints[i][1], i])
			   }
				else if(Math.abs(samplePoints[i][1] - samplePoints[i+1][1]) <= tolerance){
				 	let lower = i
				 	let upper = i+1
				 	while(Math.abs(samplePoints[i][1] - samplePoints[upper][1]) <= tolerance && upper < samplePoints.length-1)
				 		upper = upper + 1
				 	let idx = Math.floor((lower + upper) / 2)
				 	i = upper
				 	summit.push([samplePoints[idx][0], samplePoints[idx][1], idx])
				 	console.log('flat', [samplePoints[idx][0], samplePoints[idx][1], idx])
				 	continue
				}
			}
			i = i+1
		}
		console.log('summit.length', summit.length)
		for(i = 0; i < summit.length; i++){
		 	console.log(summit[i][0], summit[i][1], summit[i][2])
		}

		// find corner
		let c = []
		let n = []
		for(i = 0; i < samplePoints.length; i++){
			c.push(-1)
			n.push(0)
		}
		let n_threshold = 5
		for(i = 1; i < samplePoints.length-1; i++){
			n[i] = 1
			let c_max = -1
			while(i - n[i] >= 0 && i + n[i] < samplePoints.length-1 && n[i] <= n_threshold){
				let a = [samplePoints[i][0] - samplePoints[i+n[i]][0], samplePoints[i][1] - samplePoints[i+n[i]][1]]
				let b = [samplePoints[i][0] - samplePoints[i-n[i]][0], samplePoints[i][1] - samplePoints[i-n[i]][1]]
				let c_temp = (a[0]*b[0] + a[1]*b[1]) / (Math.sqrt(a[0]**2 + a[1]**2) * Math.sqrt(b[0]**2 + b[1]**2))
				if(c_temp >= c_max){
					c_max = c_temp
				}
				else break
				n[i] = n[i] + 1
			c[i] = c_max
			}
		}

		let c_threshold = -0.
		let corner = []
		for(i = 1; i < c.length-1; i++){
			let flag = 0
			for(let j = i-n[i]; j <= i+n[i]; j++){
				if(c[i] <= c[j] && j != i){
					flag = 1
					break
				}
			}
			if(flag == 0 && c[i] > c_threshold){
				corner.push([samplePoints[i][0], samplePoints[i][1], i])
			}
		}
		console.log('corner num', corner.length)
		for(i = 0; i < corner.length; i++){
			console.log(corner[i][0], corner[i][1], corner[i][2])
		}

		// merge corner and summit into segments
		let summit_count = 0
		let corner_count = 0
		let segment = []
		if(corner.length > 0){
			for(i = 0; i < samplePoints.length; i++){
				// console.log(summit[summit_count][2], corner[corner_count][2], i)
				if(summit[summit_count][2] == i && corner[corner_count][2] == i){
					segment.push([summit[summit_count][0], summit[summit_count][1], summit[summit_count][2]])
					// console.log('push both')
					summit_count = summit_count + 1
					corner_count = corner_count + 1
				}
				else if(summit[summit_count][2] == i){
					segment.push([summit[summit_count][0], summit[summit_count][1], summit[summit_count][2]])
					// console.log('push summit')
					summit_count = summit_count + 1
				}
				else if(corner[corner_count][2] == i){
					segment.push([corner[corner_count][0], corner[corner_count][1], corner[corner_count][2]])
					// console.log('push corner')
					corner_count = corner_count + 1
				}
				if(summit_count >= summit.length-1){
					summit_count = summit.length-1
				}
				if(corner_count >= corner.length-1){
					corner_count = corner.length-1
				}
			}
		}
		else{
			segment = summit
		}

		console.log('segment num ', segment.length)

		if(segment[0][2] != 0)
			segment.unshift([samplePoints[0][0], samplePoints[0][1], 0])
		if(segment[segment.length-1][2] != samplePoints.length-1)
			segment.push([samplePoints[samplePoints.length-1][0], samplePoints[samplePoints.length-1][1], samplePoints.length-1])

		console.log('segment num ', segment.length)
		// find segments which are too close
		let drop_idx = []
		for(i = 0; i < segment.length-1; i++){
			let dis = Math.sqrt((segment[i][0] - segment[i+1][1])**2 + (segment[i][1] - segment[i+1][1])**2)
			// console.log(dis)
			if(samplePoints.length > 20 && Math.abs(segment[i][2] - segment[i+1][2]) <= 3){
				drop_idx.push(i)
			}
		}

		let new_segment = []
		let drop_count = 0
		for(i = 0; i < segment.length; i++){
			if(i == drop_idx[drop_count]){
				drop_count = drop_count + 1
			}
			else{
				new_segment.push(segment[i])
			}
		}
		segment = new_segment
		console.log('drop close', segment.length)

		// find colinear segments
		let flag = 1
		while(flag == 1 && segment.length > 20){
			drop_idx = []
			for(i = 1; i < segment.length-1; i++){
				let a = [segment[i][0]-segment[i-1][0], segment[i][1]-segment[i-1][1]]
				let b = [segment[i][0]-segment[i+1][0], segment[i][1]-segment[i+1][1]]
				if(((a[0]*b[0] + a[1]*b[1]) / (Math.sqrt(a[0]**2 + a[1]**2) * Math.sqrt(b[0]**2 + b[1]**2))) < -0.8){
					drop_idx.push(i)
				}
			}
			if(drop_idx.length == 0){
				flag = 0
			}
			else{
				let new_segment = []
				let drop_count = 0
				for(i = 0; i < segment.length; i++){
					if(i == drop_idx[drop_count]){
						drop_count = drop_count + 1
					}
					else{
						new_segment.push(segment[i])
					}
				}
				segment = new_segment
			}
		}
		console.log('drop colinear', segment.length)

		// calculate arc and angle
		let angle = []
		let r = []
		let classify = []
		for(i = 0; i < segment.length-1; i++){
			let arc = 0
			let dis = Math.sqrt((segment[i][0] - segment[i+1][1])**2 + (segment[i][1] - segment[i+1][1])**2)
			for(let j = segment[i][2]; j < segment[i+1][2]; j++){
				arc = arc + Math.sqrt((samplePoints[j][0] - samplePoints[j+1][0])**2 + (samplePoints[j][1] - samplePoints[j+1][1])**2)
			}
			if(segment[i][0] == segment[i+1][0] && segment[i+1][1] > segment[i][1]){
				angle.push(90)
			}
			else if(segment[i][0] == segment[i+1][0] && segment[i+1][1] <= segment[i][1]){
				angle.push(-90)
			}
			else{
				angle.push(Math.atan((segment[i+1][1] - segment[i][1]) / (segment[i+1][0] - segment[i][0])) * 180 / Math.PI)
			}
			r.push(arc / dis)
		}

		let curveConstant = 1.2
		for(i = 0; i < r.length; i++){
			if(r[i] > curveConstant && angle[i] > 0){
				let total = 0
				for(let j = segment[i][2]; j <= segment[i+1][2]; j++){
					total = total + samplePoints[j][0]
				}
				let end_point_avg = (segment[i+1][0] + segment[i][0]) / 2
				let arc_avg = total / (segment[i+1][2] - segment[i][2] + 1)
				if(arc_avg > end_point_avg){
					if((segment[i+1][0] - segment[i][0]) > 0)
						classify.push(2)
					else
						classify.push(1)
				}
				else{
					if((segment[i+1][0] - segment[i][0]) > 0)
						classify.push(1)
					else
						classify.push(2)
				}
			}
			else if(r[i] > curveConstant && angle[i] <= 0){
				let total = 0
				for(let j = segment[i][2]; j <= segment[i+1][2]; j++){
					total = total + samplePoints[j][0]
				}
				let end_point_avg = (segment[i+1][0] + segment[i][0]) / 2
				let arc_avg = total / (segment[i+1][2] - segment[i][2] + 1)
				if(arc_avg < end_point_avg){
					if((segment[i+1][0] - segment[i][0]) > 0)
						classify.push(2)
					else
						classify.push(1)
				}
				else{
					if((segment[i+1][0] - segment[i][0]) > 0)
						classify.push(1)
					else
						classify.push(2)
				}
			}
			else if(r[i] <= curveConstant){
				if(Math.abs(angle[i]) < 30){
					classify.push(8)
				}
				else if(Math.abs(angle[i]) > 60){
					classify.push(7)
				}
				else if(angle[i] <= 60 && angle[i] >= 30){
					classify.push(5)
				}
				else if(angle[i] >= -60 && angle[i] <= -30){
					classify.push(6)
				}
			}
		}

		console.log('classify')
		for(i = 0; i < classify.length; i++){
			console.log(classify[i])
		}

		height = 10
		// 1: walk, 2: jump, 3: front flip, 4: back flip
		i = 0
		num = 0
		// detect multiply motions
		while(i < classify.length){
			if(classify.length >= 4){
				if(classify[i] == 1 || classify[i] == 5 || classify[i] == 7){
					if(classify[i+1] == 1 || classify[i+1] == 6 || classify[i+1] == 7){
						if(classify[i+2] == 1 || classify[i+2] == 5 || classify[i+2] == 7){
							if(classify[i+3] == 1 || classify[i+3] == 6 || classify[i+3] == 7){
								motions.push(3)
							}
						}
					}
				}
			}
			else if((classify[i] == 1 && classify[i+1] == 1) || (classify[i] == 1 && classify[i+1] == 6) ||
			   (classify[i] == 1 && classify[i+1] == 7) || (classify[i] == 5 && classify[i+1] == 1) ||
			   (classify[i] == 7 && classify[i+1] == 1)){
				if(segment[i+1][1] <= height){
					motions.push(1)
				}
				else motions.push(2)
			}
			else if((classify[i] == 5 && classify[i+1] == 6) || (classify[i] == 5 && classify[i+1] == 7) ||
					(classify[i] == 5 && classify[i+1] == 5) || (classify[i] == 7 && classify[i+1] == 6) ||
					(classify[i] == 7 && classify[i+1] == 7) || (classify[i] == 6 && classify[i+1] == 6) ||
					(classify[i] == 6 && classify[i+1] == 5) || (classify[i] == 6 && classify[i+1] == 7)){
				if(segment[i+1][1] <= height){
					motions.push(1)
				}
				else motions.push(2)
			}
			else if((classify[i] == 1 && classify[i+1] == 8)){
				if(segment[i+1][1] <= height){
					motions.push(1)
				}
				else motions.push(2)
			}
			else if((classify[i] == 2 && classify[i+1] == 2) || (classify[i] == 7 && classify[i+1] == 2) ||
				    (classify[i] == 6 && classify[i+1] == 2) || (classify[i] == 5 && classify[i+1] == 2) ||
				    (classify[i] == 2 && classify[i+1] == 7) || (classify[i] == 2 && classify[i+1] == 6) ||
				    (classify[i] == 2 && classify[i+1] == 5) || (classify[i] == 2 && classify[i+1] == 1)){
				motions.push(4)
			}
			i = i+1
			num = num+1
		}
	}
	return motions
}

function drawpath(){
	originx1 = characterPostion[0]
	originy1 = characterPostion[1]
	for(let i = 0; i < points.length-1; i++){
		let newx1 = characterPostion[0] = originx1 + points[i+1][0] - points[i][0]
		let newy1 = characterPostion[1] = originy1 + points[i+1][1] - points[i][1]
		moves.push([newx1, newy1])

		ctx2.strokeStyle = "black";
		ctx2.beginPath()
		ctx2.moveTo(originx1, originy1)
		ctx2.lineTo(newx1, newy1)
		ctx2.stroke()

		originx1 = newx1
		originy1 = newy1
	}
}


/// motion
function walk(){
	ctx2.clearRect(0, 0, canvas2.width, canvas2.height)
	drawWalk([400+25*t, 400], t)
	t++
	if(t == 7){
		t = 0
		setTimeout("init()", 1000)
		return
	}
	setTimeout("walk()", 300)
}

function jump(){
	ctx2.clearRect(0, 0, canvas2.width, canvas2.height)
	let jump_height = [0, 40, 60, 70, 35, 15, 0, 0]
	if(t == 0){
		drawJump([400, 400], 0)
	}
	else{
		drawJump([400+40*(t-1), 400-jump_height[t-1]], t)
	}
	t++
	if(t == 9){
		t = 0
		setTimeout("init()", 1000)
		return
	}
	setTimeout("jump()", 300)
}

function frontFlip(){
	ctx2.clearRect(0, 0, canvas2.width, canvas2.height)
	let jump_height = [0, 40, 70, 75, 65, 35, 0, 0]
	if(t == 0){
		drawFrontFlip([400, 400], 0)
	}
	else{
		drawFrontFlip([400+40*(t-1), 400-jump_height[t-1]], t)
	}
	t++
	if(t == 8){
		t = 0
		setTimeout("init()", 1000)
		return
	}
	setTimeout("frontFlip()", 300)
}

function backFlip(){
	ctx2.clearRect(0, 0, canvas2.width, canvas2.height)
	let jump_height = [0, 40, 70, 60, 30, 0]
	if(t == 0){
		drawBackFlip([400, 400], 0)
	}
	else{
		drawBackFlip([400-40*(t-1), 400-jump_height[t-1]], t)
	}
	t++
	if(t == 7){
		t = 0
		setTimeout("init()", 1000)
		return
	}
	setTimeout("backFlip()", 300)
}


/// draw

// stand
function drawStand(postion) {
	//頭
	ctx2.strokeStyle = "red"
	ctx2.beginPath()
	ctx2.arc(postion[0], postion[1]-150, 25, 0, 2 * Math.PI)
	ctx2.stroke()

	//身體
	ctx2.beginPath()
	ctx2.moveTo(postion[0], postion[1]-125)
	ctx2.lineTo(postion[0], postion[1]-60)
	ctx2.stroke()

	//手
	ctx2.beginPath()
	ctx2.moveTo(postion[0], postion[1]-120)
	ctx2.lineTo(postion[0]+30, postion[1]-60)
	ctx2.stroke()

	ctx2.beginPath()
	ctx2.moveTo(postion[0], postion[1]-120)
	ctx2.lineTo(postion[0]-30, postion[1]-60)
	ctx2.stroke()

	//腳
	ctx2.beginPath()
	ctx2.moveTo(postion[0], postion[1]-60)
	ctx2.lineTo(postion[0]+30, postion[1])
	ctx2.stroke()

	ctx2.beginPath()
	ctx2.moveTo(postion[0], postion[1]-60)
	ctx2.lineTo(postion[0]-30, postion[1])
	ctx2.stroke()
}

// walk
function drawWalk(postion, i){
	ctx2.strokeStyle = "red"
	if(i == 0){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0], postion[1]-150, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-125)
		ctx2.lineTo(postion[0], postion[1]-60)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0], postion[1]-90)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-90)
		ctx2.lineTo(postion[0], postion[1]-53)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0], postion[1]-90)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-90)
		ctx2.lineTo(postion[0], postion[1]-53)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0], postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0], postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()
	}
	else if(i == 1){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0], postion[1]-150, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-125)
		ctx2.lineTo(postion[0]-5, postion[1]-60)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0]-10, postion[1]-92)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-10, postion[1]-92)
		ctx2.lineTo(postion[0]-5, postion[1]-55)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0]+10, postion[1]-92)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-92)
		ctx2.lineTo(postion[0]+30, postion[1]-60)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-5, postion[1]-60)
		ctx2.lineTo(postion[0]+10, postion[1]-35)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-35)
		ctx2.lineTo(postion[0]+10, postion[1]-5)
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-5, postion[1]-60)
		ctx2.lineTo(postion[0]-10, postion[1]-25)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-10, postion[1]-25)
		ctx2.lineTo(postion[0]-15, postion[1])
		ctx2.stroke()
	}
	else if(i == 2){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0], postion[1]-150, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-125)
		ctx2.lineTo(postion[0], postion[1]-60)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0]-5, postion[1]-90)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-5, postion[1]-90)
		ctx2.lineTo(postion[0]+10, postion[1]-55)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0]+5, postion[1]-90)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+5, postion[1]-90)
		ctx2.lineTo(postion[0]+15, postion[1]-60)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0]-10, postion[1]-25)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-10, postion[1]-25)
		ctx2.lineTo(postion[0]-20, postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0]+30, postion[1]-50)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+30, postion[1]-50)
		ctx2.lineTo(postion[0]+30, postion[1]-15)
		ctx2.stroke()
	}
	else if(i == 3){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0], postion[1]-140, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-115)
		ctx2.lineTo(postion[0], postion[1]-50)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-110)
		ctx2.lineTo(postion[0]+15, postion[1]-90)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-90)
		ctx2.lineTo(postion[0]+40, postion[1]-70)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-110)
		ctx2.lineTo(postion[0]-15, postion[1]-90)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-15, postion[1]-90)
		ctx2.lineTo(postion[0]-30, postion[1]-65)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]-5, postion[1]-20)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-5, postion[1]-20)
		ctx2.lineTo(postion[0]-30, postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+15, postion[1]-25)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-25)
		ctx2.lineTo(postion[0]+25, postion[1])
		ctx2.stroke()
	}
	else if(i == 4){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0], postion[1]-150, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-125)
		ctx2.lineTo(postion[0]-5, postion[1]-60)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0]-10, postion[1]-92)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-10, postion[1]-92)
		ctx2.lineTo(postion[0]-5, postion[1]-55)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0]+10, postion[1]-92)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-92)
		ctx2.lineTo(postion[0]+30, postion[1]-60)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-5, postion[1]-55)
		ctx2.lineTo(postion[0]+1, postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+1, postion[1]-30)
		ctx2.lineTo(postion[0]+5, postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-5, postion[1]-55)
		ctx2.lineTo(postion[0]-5, postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-5, postion[1]-30)
		ctx2.lineTo(postion[0]-10, postion[1])
		ctx2.stroke()
	}
	else if(i == 5){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0], postion[1]-150, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-125)
		ctx2.lineTo(postion[0], postion[1]-60)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0]+15, postion[1]-100)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-100)
		ctx2.lineTo(postion[0]+40, postion[1]-80)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0]-15, postion[1]-100)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-15, postion[1]-100)
		ctx2.lineTo(postion[0]-30, postion[1]-75)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0]+5, postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+5, postion[1]-30)
		ctx2.lineTo(postion[0]-15, postion[1]-10)
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0]+7, postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+7, postion[1]-30)
		ctx2.lineTo(postion[0]+5, postion[1])
		ctx2.stroke()
	}
	else if(i == 6){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0], postion[1]-150, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-125)
		ctx2.lineTo(postion[0], postion[1]-60)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0], postion[1]-90)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-90)
		ctx2.lineTo(postion[0], postion[1]-53)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0], postion[1]-90)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-90)
		ctx2.lineTo(postion[0], postion[1]-53)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0], postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0], postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()
	}
	return
}

// jump
function drawJump(postion, i){
	ctx2.strokeStyle = "red"
	if(i == 0){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0], postion[1]-150, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-125)
		ctx2.lineTo(postion[0], postion[1]-60)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0], postion[1]-90)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-90)
		ctx2.lineTo(postion[0], postion[1]-53)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0], postion[1]-90)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-90)
		ctx2.lineTo(postion[0], postion[1]-53)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0], postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0], postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()
	}
	else if(i == 1){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0]+85, postion[1]-65, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+60, postion[1]-60)
		ctx2.lineTo(postion[0], postion[1]-50)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+55, postion[1]-59)
		ctx2.lineTo(postion[0]+45, postion[1]-95)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+45, postion[1]-95)
		ctx2.lineTo(postion[0]+10, postion[1]-90)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+55, postion[1]-59)
		ctx2.lineTo(postion[0]+50, postion[1]-95)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+50, postion[1]-95)
		ctx2.lineTo(postion[0]+15, postion[1]-85)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+10, postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-30)
		ctx2.lineTo(postion[0]-5, postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+15, postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()
	}
	else if(i == 2){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0]+15, postion[1]-145, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-120)
		ctx2.lineTo(postion[0]-5, postion[1]-60)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+8, postion[1]-115)
		ctx2.lineTo(postion[0]+10, postion[1]-145)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-145)
		ctx2.lineTo(postion[0]+12, postion[1]-175)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+8, postion[1]-115)
		ctx2.lineTo(postion[0]+13, postion[1]-144)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+13, postion[1]-144)
		ctx2.lineTo(postion[0]+15, postion[1]-174)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-5, postion[1]-60)
		ctx2.lineTo(postion[0], postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-30)
		ctx2.lineTo(postion[0]-5, postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-5, postion[1]-60)
		ctx2.lineTo(postion[0]+5, postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+5, postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()
	}
	else if(i == 3){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0]+85, postion[1]-75, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+60, postion[1]-70)
		ctx2.lineTo(postion[0], postion[1]-50)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+53, postion[1]-67)
		ctx2.lineTo(postion[0]+85, postion[1]-70)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+85, postion[1]-70)
		ctx2.lineTo(postion[0]+115, postion[1]-80)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+53, postion[1]-67)
		ctx2.lineTo(postion[0]+85, postion[1]-64)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+85, postion[1]-64)
		ctx2.lineTo(postion[0]+115, postion[1]-75)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+10, postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-30)
		ctx2.lineTo(postion[0]-15, postion[1]-10)
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+15, postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-30)
		ctx2.lineTo(postion[0]-10, postion[1]-10)
		ctx2.stroke()
	}
	else if(i == 4){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0]+15, postion[1]-145, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-120)
		ctx2.lineTo(postion[0]-5, postion[1]-60)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+9, postion[1]-110)
		ctx2.lineTo(postion[0]+40, postion[1]-100)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+40, postion[1]-100)
		ctx2.lineTo(postion[0]+75, postion[1]-110)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+9, postion[1]-110)
		ctx2.lineTo(postion[0]+38, postion[1]-95)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+38, postion[1]-95)
		ctx2.lineTo(postion[0]+73, postion[1]-105)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-5, postion[1]-60)
		ctx2.lineTo(postion[0]+10, postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-30)
		ctx2.lineTo(postion[0]-5, postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-5, postion[1]-60)
		ctx2.lineTo(postion[0]+15, postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()
	}
	else if(i == 5){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0], postion[1]-150, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-125)
		ctx2.lineTo(postion[0], postion[1]-60)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0]+10, postion[1]-90)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-90)
		ctx2.lineTo(postion[0]+35, postion[1]-105)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0]+25, postion[1]-110)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+25, postion[1]-110)
		ctx2.lineTo(postion[0]+45, postion[1]-130)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0]+5, postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+5, postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0]+10, postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-30)
		ctx2.lineTo(postion[0]+5, postion[1]-5)
		ctx2.stroke()
	}
	else if(i == 6){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0], postion[1]-150, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-125)
		ctx2.lineTo(postion[0]+10, postion[1]-55)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0]+10, postion[1]-90)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-90)
		ctx2.lineTo(postion[0]+35, postion[1]-105)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0]+25, postion[1]-110)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+25, postion[1]-110)
		ctx2.lineTo(postion[0]+45, postion[1]-130)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-55)
		ctx2.lineTo(postion[0]+15, postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-30)
		ctx2.lineTo(postion[0]+10, postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-55)
		ctx2.lineTo(postion[0]+20, postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+20, postion[1]-30)
		ctx2.lineTo(postion[0]+15, postion[1]-5)
		ctx2.stroke()
	}
	else if(i == 7){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0]+85, postion[1]-65, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+60, postion[1]-60)
		ctx2.lineTo(postion[0], postion[1]-50)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+55, postion[1]-59)
		ctx2.lineTo(postion[0]+25, postion[1]-45)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+25, postion[1]-45)
		ctx2.lineTo(postion[0]+30, postion[1]-20)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+55, postion[1]-59)
		ctx2.lineTo(postion[0]+28, postion[1]-43)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+28, postion[1]-43)
		ctx2.lineTo(postion[0]+32, postion[1]-22)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+10, postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-30)
		ctx2.lineTo(postion[0]-5, postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+15, postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()
	}
	else if(i == 8){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0], postion[1]-150, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-125)
		ctx2.lineTo(postion[0], postion[1]-60)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0], postion[1]-90)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-90)
		ctx2.lineTo(postion[0], postion[1]-53)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0], postion[1]-90)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-90)
		ctx2.lineTo(postion[0], postion[1]-53)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0], postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0], postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()
	}
}

// front flip
function drawFrontFlip(postion, i){
	ctx2.strokeStyle = "red"
	if(i == 0){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0], postion[1]-150, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-125)
		ctx2.lineTo(postion[0], postion[1]-60)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0], postion[1]-90)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-90)
		ctx2.lineTo(postion[0], postion[1]-53)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0], postion[1]-90)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-90)
		ctx2.lineTo(postion[0], postion[1]-53)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0], postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0], postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()
	}
	else if(i == 1){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0]+80, postion[1]-75, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+55, postion[1]-70)
		ctx2.lineTo(postion[0], postion[1]-50)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+53, postion[1]-69)
		ctx2.lineTo(postion[0]+25, postion[1]-55)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+25, postion[1]-55)
		ctx2.lineTo(postion[0]+30, postion[1]-25)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+53, postion[1]-69)
		ctx2.lineTo(postion[0]+20, postion[1]-62)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+20, postion[1]-62)
		ctx2.lineTo(postion[0]+20, postion[1]-30)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+10, postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-30)
		ctx2.lineTo(postion[0]-5, postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+15, postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()
	}
	else if(i == 2){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0]+60, postion[1]-68, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+50, postion[1]-90)
		ctx2.lineTo(postion[0], postion[1]-120)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+45, postion[1]-94)
		ctx2.lineTo(postion[0]+50, postion[1]-55)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+50, postion[1]-55)
		ctx2.lineTo(postion[0]+60, postion[1]-25)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+45, postion[1]-94)
		ctx2.lineTo(postion[0]+45, postion[1]-55)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+45, postion[1]-55)
		ctx2.lineTo(postion[0]+55, postion[1]-30)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0]-10, postion[1]-90)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-10, postion[1]-90)
		ctx2.lineTo(postion[0]-40, postion[1]-75)
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0], postion[1]-90)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-90)
		ctx2.lineTo(postion[0]-25, postion[1]-70)
		ctx2.stroke()
	}
	else if(i == 3){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0]-70, postion[1]-105, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-50, postion[1]-90)
		ctx2.lineTo(postion[0]+15, postion[1]-75)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-45, postion[1]-89)
		ctx2.lineTo(postion[0]-15, postion[1]-85)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-15, postion[1]-85)
		ctx2.lineTo(postion[0]+20, postion[1]-90)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-45, postion[1]-89)
		ctx2.lineTo(postion[0]-10, postion[1]-89)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-10, postion[1]-89)
		ctx2.lineTo(postion[0]+15, postion[1]-95)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-75)
		ctx2.lineTo(postion[0], postion[1]-95)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-95)
		ctx2.lineTo(postion[0]+20, postion[1]-115)
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-75)
		ctx2.lineTo(postion[0]+5, postion[1]-98)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+5, postion[1]-98)
		ctx2.lineTo(postion[0]+25, postion[1]-112)
		ctx2.stroke()
	}
	else if(i == 4){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0], postion[1]-33, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-55)
		ctx2.lineTo(postion[0], postion[1]-120)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-60)
		ctx2.lineTo(postion[0], postion[1]-85)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-85)
		ctx2.lineTo(postion[0]-30, postion[1]-90)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-60)
		ctx2.lineTo(postion[0]-5, postion[1]-83)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-5, postion[1]-83)
		ctx2.lineTo(postion[0]-35, postion[1]-85)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0]-10, postion[1]-90)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-10, postion[1]-90)
		ctx2.lineTo(postion[0]-40, postion[1]-80)
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0]-20, postion[1]-95)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-20, postion[1]-95)
		ctx2.lineTo(postion[0]-50, postion[1]-85)
		ctx2.stroke()
	}
	else if(i == 5){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0]-50, postion[1]-115, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-50, postion[1]-90)
		ctx2.lineTo(postion[0], postion[1]-50)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-44, postion[1]-85)
		ctx2.lineTo(postion[0]-20, postion[1]-75)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-20, postion[1]-75)
		ctx2.lineTo(postion[0]+5, postion[1]-80)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-44, postion[1]-85)
		ctx2.lineTo(postion[0]-15, postion[1]-80)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-15, postion[1]-80)
		ctx2.lineTo(postion[0]+10, postion[1]-85)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+15, postion[1]-80)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-80)
		ctx2.lineTo(postion[0]+45, postion[1]-75)
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+18, postion[1]-77)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+18, postion[1]-77)
		ctx2.lineTo(postion[0]+48, postion[1]-72)
		ctx2.stroke()
	}
	else if(i == 6){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0], postion[1]-150, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-125)
		ctx2.lineTo(postion[0]+5, postion[1]-60)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0]+5, postion[1]-90)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+5, postion[1]-90)
		ctx2.lineTo(postion[0]+40, postion[1]-90)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0]+15, postion[1]-95)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-95)
		ctx2.lineTo(postion[0]+45, postion[1]-100)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+5, postion[1]-60)
		ctx2.lineTo(postion[0]+15, postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-30)
		ctx2.lineTo(postion[0]+15, postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+5, postion[1]-60)
		ctx2.lineTo(postion[0]+18, postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+18, postion[1]-30)
		ctx2.lineTo(postion[0]+18, postion[1])
		ctx2.stroke()
	}
	else if(i == 7){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0]+30, postion[1]-127, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+20, postion[1]-105)
		ctx2.lineTo(postion[0], postion[1]-50)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+18, postion[1]-100)
		ctx2.lineTo(postion[0]+25, postion[1]-70)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+25, postion[1]-70)
		ctx2.lineTo(postion[0]+55, postion[1]-65)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+18, postion[1]-100)
		ctx2.lineTo(postion[0]+20, postion[1]-70)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+20, postion[1]-70)
		ctx2.lineTo(postion[0]+50, postion[1]-63)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+10, postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-30)
		ctx2.lineTo(postion[0]-5, postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+15, postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()
	}
}

// back flip
function drawBackFlip(postion, i){
	ctx2.strokeStyle = "red"
	if(i == 0){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0], postion[1]-150, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-125)
		ctx2.lineTo(postion[0], postion[1]-60)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0], postion[1]-90)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-90)
		ctx2.lineTo(postion[0], postion[1]-53)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-120)
		ctx2.lineTo(postion[0], postion[1]-90)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-90)
		ctx2.lineTo(postion[0], postion[1]-53)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0], postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-60)
		ctx2.lineTo(postion[0], postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()
		
	}
	else if(i == 1){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0]+55, postion[1]-120, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+40, postion[1]-100)
		ctx2.lineTo(postion[0], postion[1]-50)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+37, postion[1]-95)
		ctx2.lineTo(postion[0]+35, postion[1]-65)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+35, postion[1]-65)
		ctx2.lineTo(postion[0]+50, postion[1]-35)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+37, postion[1]-95)
		ctx2.lineTo(postion[0]+20, postion[1]-65)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+20, postion[1]-65)
		ctx2.lineTo(postion[0]+30, postion[1]-35)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+10, postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-30)
		ctx2.lineTo(postion[0]-5, postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+15, postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()
	}
	else if(i == 2){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0]-55, postion[1]-120, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-40, postion[1]-100)
		ctx2.lineTo(postion[0], postion[1]-50)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-37, postion[1]-95)
		ctx2.lineTo(postion[0]-70, postion[1]-85)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-70, postion[1]-85)
		ctx2.lineTo(postion[0]-100, postion[1]-80)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-37, postion[1]-95)
		ctx2.lineTo(postion[0]-75, postion[1]-90)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-75, postion[1]-90)
		ctx2.lineTo(postion[0]-105, postion[1]-85)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+30, postion[1]-45)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+30, postion[1]-45)
		ctx2.lineTo(postion[0]+25, postion[1]-15)
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+35, postion[1]-40)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+35, postion[1]-40)
		ctx2.lineTo(postion[0]+30, postion[1]-10)
		ctx2.stroke()
	}
	else if(i == 3){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0]-5, postion[1]-45, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-70)
		ctx2.lineTo(postion[0]+10, postion[1]-130)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-75)
		ctx2.lineTo(postion[0]-10, postion[1]-45)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-10, postion[1]-45)
		ctx2.lineTo(postion[0]-15, postion[1]-15)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-75)
		ctx2.lineTo(postion[0]-5, postion[1]-45)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-5, postion[1]-45)
		ctx2.lineTo(postion[0]-5, postion[1]-15)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-130)
		ctx2.lineTo(postion[0]-10, postion[1]-160)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-10, postion[1]-160)
		ctx2.lineTo(postion[0]+45, postion[1]-160)
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-130)
		ctx2.lineTo(postion[0]-15, postion[1]-158)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-15, postion[1]-158)
		ctx2.lineTo(postion[0]+40, postion[1]-170)
		ctx2.stroke()
	}
	else if(i == 4){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0]+25, postion[1]-47, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+20, postion[1]-70)
		ctx2.lineTo(postion[0], postion[1]-130)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+18, postion[1]-75)
		ctx2.lineTo(postion[0]-15, postion[1]-70)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-15, postion[1]-70)
		ctx2.lineTo(postion[0]-45, postion[1]-45)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+18, postion[1]-75)
		ctx2.lineTo(postion[0]-20, postion[1]-65)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-20, postion[1]-65)
		ctx2.lineTo(postion[0]-45, postion[1]-35)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-130)
		ctx2.lineTo(postion[0]-10, postion[1]-100)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-10, postion[1]-100)
		ctx2.lineTo(postion[0]-30, postion[1]-125)
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-130)
		ctx2.lineTo(postion[0]-15, postion[1]-105)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-15, postion[1]-105)
		ctx2.lineTo(postion[0]-40, postion[1]-130)
		ctx2.stroke()
	}
	else if(i == 5){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0]+30, postion[1]-145, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-130)
		ctx2.lineTo(postion[0]-10, postion[1]-70)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+9, postion[1]-125)
		ctx2.lineTo(postion[0]+7, postion[1]-95)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+7, postion[1]-95)
		ctx2.lineTo(postion[0]+35, postion[1]-75)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+9, postion[1]-125)
		ctx2.lineTo(postion[0]+3, postion[1]-95)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+3, postion[1]-95)
		ctx2.lineTo(postion[0]+30, postion[1]-80)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-10, postion[1]-70)
		ctx2.lineTo(postion[0]+15, postion[1]-60)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-60)
		ctx2.lineTo(postion[0]+10, postion[1]-30)
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0]-10, postion[1]-70)
		ctx2.lineTo(postion[0]+20, postion[1]-65)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+20, postion[1]-65)
		ctx2.lineTo(postion[0]+15, postion[1]-35)
		ctx2.stroke()
	}
	else if(i == 6){
		// head
		ctx2.beginPath()
		ctx2.arc(postion[0]+63, postion[1]-106, 25, 0, 2 * Math.PI)
		ctx2.stroke()

		// body
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+45, postion[1]-90)
		ctx2.lineTo(postion[0], postion[1]-50)
		ctx2.stroke()

		// right forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+40, postion[1]-86)
		ctx2.lineTo(postion[0]+45, postion[1]-55)
		ctx2.stroke()

		// right upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+45, postion[1]-55)
		ctx2.lineTo(postion[0]+80, postion[1]-50)
		ctx2.stroke()

		// left forearm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+40, postion[1]-86)
		ctx2.lineTo(postion[0]+50, postion[1]-55)
		ctx2.stroke()

		// left upper arm
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+50, postion[1]-55)
		ctx2.lineTo(postion[0]+85, postion[1]-55)
		ctx2.stroke()

		// right thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+10, postion[1]-30)
		ctx2.stroke()

		// right calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+10, postion[1]-30)
		ctx2.lineTo(postion[0]-5, postion[1])
		ctx2.stroke()

		// left thigh
		ctx2.beginPath()
		ctx2.moveTo(postion[0], postion[1]-50)
		ctx2.lineTo(postion[0]+15, postion[1]-30)
		ctx2.stroke()

		// left calf
		ctx2.beginPath()
		ctx2.moveTo(postion[0]+15, postion[1]-30)
		ctx2.lineTo(postion[0], postion[1])
		ctx2.stroke()
	}
}

init()