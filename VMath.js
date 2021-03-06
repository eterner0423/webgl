(function (Math) {
	const $Math = {
		ONE: 180 / Math.PI, // 1角度
		RADIAN: Math.PI / 180 // 1弧度
	};

	// 辅助
	function formatMatrix(matrix, row, col) {
		matrix.row = row;
		matrix.col = col;
		matrix.matrix = true;
		return matrix;
	}

	// 通用
	function toDeg(point) { // 据坐标求角度
		let add = 0;
		if(point[0] < 0) add = 180; else if(point[1] < 0) add = 360;
		return Math.atan(point[1] / point[0]) * $Math.ONE + add;
	}

	function random(min, max) { // 随机生成区间值
		return ~~(Math.random() * (max - min + 1) + min);
	}

	function isPowerOf2(num) { // 判断数是否的2的幂次数
		return !(num & (num - 1));
	}

	function toPoint(deg, r) { // 据角和半径求坐标
		return [Math.cos(deg * $Math.RADIAN) * r, Math.sin(deg * $Math.RADIAN) * r];
	}

	function rotate(point, deg) { //据坐标求旋转后的坐标
		let sind = Math.sin(deg * $Math.RADIAN),
			cosd = Math.cos(deg * $Math.RADIAN);
		return [point[0] * cosd - point[1] * sind, point[0] * sind + point[1] * cosd];
	}

	function dotToDeg(dotValue) { // 点乘值转角度
		return Math.acos(dotValue) * $Math.ONE;
	}

	function bezierCurve(points, step, callback) { // 贝塞尔曲线
		if(step < 0.0001) return;
		let path = [],
			contain = [],
			num = 0,
			len = points.length - 1;

		while (num < 1) {
			let num2 = len + 1;
			contain = points;
			while (--num2) {
				let points2 = [];
				for (let i = 0; i < num2; i++) {
					let c0 = contain[i],
						c1 = contain[i + 1];
					points2[i] = [c0[0] + (c1[0] - c0[0]) * num, c0[1] + (c1[1] - c0[1]) * num, c0[2] + (c1[2] - c0[2]) * num];
				}
				contain = points2;
			}
			callback && callback(contain[0]);
			path.push(contain[0]);
			num += step;
		}

		// 解决js计算存在的浮点问题
		if(num + 0.0000001 < 1 + step) {
			callback && callback(points[len]);
			path.push(points[len]);
		}
		return path;
	}

	// 矩阵
	let Matrix = {};

	Matrix.makeMatrix = function(size, fill) { // 创建矩阵
		let matrix = [];
		if(!Array.isArray(size)) size = [size, size];
		if(!Array.isArray(fill)) fill = [fill || 0];

		matrix.row = size[0];
		matrix.col = size[1];

		let a = fill.length - 1,
			len = matrix.row * matrix.col;
		for (let i = 0; i < len; i++) {
			matrix[i] = (fill[i] === undefined ? fill[a] : fill[i]);
		}
		matrix.matrix = true;
		return matrix;
	};

	Matrix.copy = function(matrix) { // 复制矩阵
		if(!matrix.matrix) return;
		let newMatrix = [];
		for (let i = 0; i < matrix.length; i++) {
			newMatrix[i] = matrix[i];
		}
		return formatMatrix(matrix, matrix.row, matrix.col);
	};

	Matrix.makeNumMatrix = function(size, val) { // 创建数量矩阵
		if(val === undefined) val = 1;
		let matrix = [],
			len = size * size;

		for (let i = 0; i < len; i++) {
			matrix[i] = 0;
		}
		for (let i = 0; i < size; i++) {
			matrix[i * (size + 1)] = val;
		}
		return formatMatrix(matrix, size, size);
	};

	Matrix.makeRotate = function(deg){ // 创建旋转矩阵(2D)
		let cosd = Math.cos(deg * $Math.RADIAN);
		let sind = Math.sin(deg * $Math.RADIAN);
		let matrix = [
			cosd, sind, 0,
			-sind, cosd, 0,
			0, 0, 1
		];
		return formatMatrix(matrix, 3, 3);
	};

	Matrix.makeRotateX = function(deg) { // 创建旋转矩阵X轴(3D)
		let cosd = Math.cos(deg * $Math.RADIAN);
		let sind = Math.sin(deg * $Math.RADIAN);
		let matrix = [
			1, 0, 0, 0,
			0, cosd, sind, 0,
			0, -sind, cosd, 0,
			0, 0, 0, 1
		];
		return formatMatrix(matrix, 4, 4);
	};

	Matrix.makeRotateY = function(deg) { // 创建旋转矩阵Y轴(3D)
		let cosd = Math.cos(deg * $Math.RADIAN);
		let sind = Math.sin(deg * $Math.RADIAN);
		let matrix = [
			cosd, 0, -sind, 0,
			0, 1, 0, 0,
			sind, 0, cosd, 0,
			0, 0, 0, 1
		];
		return formatMatrix(matrix, 4, 4);
	};

	Matrix.makeRotateZ = function(deg) { // 创建旋转矩阵Z轴(3D)
		let cosd = Math.cos(deg * $Math.RADIAN);
		let sind = Math.sin(deg * $Math.RADIAN);
		let matrix = [
			cosd, sind, 0, 0,
			-sind, cosd, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];
		return formatMatrix(matrix, 4, 4);
	};

	Matrix.makeScale = function(sx, sy, sz){ // 创建缩放矩阵
		let matrix;
		if(sy === undefined) sy = sx;
		if(sz === undefined) {
			matrix = [
				sx, 0, 0,
				0, sy, 0,
				0, 0, 1
			];
			return formatMatrix(matrix, 3, 3);
		}else{
			matrix = [
				sx, 0, 0, 0,
				0, sy, 0, 0,
				0, 0, sz, 0,
				0, 0, 0, 1
			];
			return formatMatrix(matrix, 4, 4);
		}
	};

	Matrix.makeTrans = function(tx, ty, tz){ // 创建平移矩阵 (3D)
		let matrix;
		if(ty === undefined) ty = tx;
		if(tz === undefined) {
			matrix = [
				1, 0, 0,
				0, 1, 0,
				tx, ty, 1
			];
			return formatMatrix(matrix, 3, 3);
		}else{
			matrix = [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				tx, ty, tz, 1
			];
			return formatMatrix(matrix, 4, 4);
		}
	};

	Matrix.mul = function(a, b){ // 矩阵相乘
		if((!a.matrix || !b.matrix)) return;
		if(a.col !== b.row) return;
		let matrix = [],
			v = 0,
			ar = a.row, ac = a.col, bc = b.col;
		for (let i = 0; i < ar; i++) {
			for (let j = 0; j < bc; j++) {
				v = 0;
				for (let k = 0; k < ac; k++) {
					v += (a[i * ac + k] * b[k * bc + j]);
				}
				matrix[i * bc + j] = v;
			}
		}
		return formatMatrix(matrix, a.row, b.col);
	};

	Matrix.muls = function(matrixArray) { // 多个矩阵相乘
		let len = matrixArray.length,
			value = matrixArray[0];

		for (let i = 1; i < len; i++) {
			value = this.mul(value, matrixArray[i]);
			if(!value) return;
		}
		return value;
	};

	Matrix.transform2D = function(param) { // 2D变换
		if(!Array.isArray(param.scale)) param.scale = [param.scale];
		if(!Array.isArray(param.trans)) param.trans = [param.trans];
		let s = this.makeScale(param.scale[0] || 1, param.scale[1]),
			r = this.makeRotate(param.rotate || 0),
			t = this.makeTrans(param.trans[0] || 0, param.trans[1]),
			matrix = this.muls([s, t, r]);
		return formatMatrix(matrix, 3, 3);
	};

	Matrix.orthogonalProjection = function(width, height, depth) { // 正交投影
		if(depth) {
			let matrix = [
				2/width, 0, 0, 0,
				0, 2/height, 0, 0,
				0, 0, -2/depth, 0,
				0, 0, 0, 1
			];
			return formatMatrix(matrix, 4, 4);
		}else{
			let matrix = [
				2/width, 0, 0,
				0, 2/height, 0,
				0, 0, 1
			];
			return formatMatrix(matrix, 3, 3);
		}
	};

	Matrix.perspectiveProjection = function(visualAngle, aspectRatio, near, far) { // 透视投影
		if(near < 1) near = 1;
		if(far < near) far = near;
		let cot = 1 / Math.tan(visualAngle / 2 * $Math.RADIAN),
			matrix = [
				1/aspectRatio*cot, 0, 0, 0,
				0, cot, 0, 0,
				0, 0, (far+near)/(near-far), -1,
				0, 0, 2*far*near/(near-far), 0
			];
		return formatMatrix(matrix, 4, 4);
	};

	Matrix.perspectiveProjection2 = function(width, height, near, far) { // 透视投影
		if(near < 1) near = 1;
		if(far < near) far = near;
		let matrix = [
			2*far/width, 0, 0, 0,
			0, 2*far/height, 0, 0,
			0, 0, (far+near)/(near-far), -1,
			0, 0, 2*far*near/(near-far), 0
		];
		return formatMatrix(matrix, 4, 4);
	};

	Matrix.lookAt = function(eyePosi, targetPosi, up) { // 视图矩阵
		let z = [eyePosi[0] - targetPosi[0], eyePosi[1] - targetPosi[1], eyePosi[2] - targetPosi[2]],
			len = 1 / Math.sqrt(z[0] * z[0] + z[1] * z[1] + z[2] * z[2]);
		z[0] *= len;
		z[1] *= len;
		z[2] *= len;
		let x = [
			up[1] * z[2] - up[2] * z[1],
			up[2] * z[0] - up[0] * z[2],
			up[0] * z[1] - up[1] * z[0]
		];
		len = 1 / Math.sqrt(x[0] * x[0] + x[1] * x[1] + x[2] * x[2]);
			x[0] *= len;
			x[1] *= len;
			x[2] *= len;

		let y = [
				z[1] * x[2] - z[2] * x[1],
				z[2] * x[0] - z[0] * x[2],
				z[0] * x[1] - z[1] * x[0]
			];
		len = 1 / Math.sqrt(y[0] * y[0] + y[1] * y[1] + y[2] * y[2]);
			y[0] *= len;
			y[1] *= len;
			y[2] *= len;
		let t = [
			-(x[0] * eyePosi[0] + x[1] * eyePosi[1] + x[2] * eyePosi[2]),
			-(y[0] * eyePosi[0] + y[1] * eyePosi[1] + y[2] * eyePosi[2]),
			-(z[0] * eyePosi[0] + z[1] * eyePosi[1] + z[2] * eyePosi[2])
		];
		return[
			x[0], y[0], z[0], 0,
			x[1], y[1], z[1], 0,
			x[2], y[2], z[2], 0,
			t[0], t[1], t[2], 1
		]
	};

	Matrix.transposition = function (matrix){ // 矩阵转置
		if(!matrix.matrix) return;
		let data = [];
		for (let i = 0; i < matrix.length; i++) {
			data[i] = matrix[((i % matrix.row) * matrix.col + Math.floor(i / matrix.row))]
		}
		for (let i = 0; i < matrix.length; i++) {
			matrix[i] = data[i];
		}
		matrix.row = [matrix.col, matrix.col = matrix.row][0];
		return matrix;
	};

	Matrix.add = function (a, b) { // 矩阵相加
		if((!a.matrix || !b.matrix)) return;
		if(a.row !== b.row || a.col !== b.col) return;
		let matrix = [];
		for (let i = 0; i < a.length; i++) {
			matrix[i] = a[i] + b[i];
		}
		return formatMatrix(matrix, a.row, a.col);
	};

	Matrix.reduce = function (a, b) { // 矩阵相减
		if((!a.matrix || !b.matrix)) return;
		if(a.row !== b.row || a.col !== b.col) return;
		let matrix = [];
		for (let i = 0; i < a.length; i++) {
			matrix[i] = a[i] - b[i];
		}
		return formatMatrix(matrix, a.row, a.col);
	};

	Matrix.inverse = function(matrix) { // 矩阵求逆 只做二三四阶处理
		if(!(matrix.matrix && matrix.row === matrix.col)) return;
		let a = matrix,
			b = [],
			outMatrix = [],
			det = 0;
		switch (matrix.row) {
			case 4:
				b[0] = a[0] * a[5] - a[1] * a[4];
				b[1] = a[0] * a[6] - a[2] * a[4];
				b[2] = a[0] * a[7] - a[3] * a[4];
				b[3] = a[1] * a[6] - a[2] * a[5];
				b[4] = a[1] * a[7] - a[3] * a[5];
				b[5] = a[2] * a[7] - a[3] * a[6];
				b[6] = a[8] * a[13] - a[9] * a[12];
				b[7] = a[8] * a[14] - a[10] * a[12];
				b[8] = a[8] * a[15] - a[11] * a[12];
				b[9] = a[9] * a[14] - a[10] * a[13];
				b[10] = a[9] * a[15] - a[11] * a[13];
				b[11] = a[10] * a[15] - a[11] * a[14];

				det = b[0] * b[11] - b[1] * b[10] + b[2] * b[9] + b[3] * b[8] - b[4] * b[7] + b[5] * b[6];
				if(!det) return;
				det = 1.0 / det;

				outMatrix = [
					(a[5] * b[11] - a[6] * b[10] + a[7] * b[9]) * det,
					(a[2] * b[10] - a[1] * b[11] - a[3] * b[9]) * det,
					(a[13] * b[5] - a[14] * b[4] + a[15] * b[3]) * det,
					(a[10] * b[4] - a[9] * b[5] - a[11] * b[3]) * det,
					(a[6] * b[8] - a[4] * b[11] - a[7] * b[7]) * det,
					(a[0] * b[11] - a[2] * b[8] + a[3] * b[7]) * det,
					(a[14] * b[2] - a[12] * b[5] - a[15] * b[1]) * det,
					(a[8] * b[5] - a[10] * b[2] + a[11] * b[1]) * det,
					(a[4] * b[10] - a[5] * b[8] + a[7] * b[6]) * det,
					(a[1] * b[8] - a[0] * b[10] - a[3] * b[6]) * det,
					(a[12] * b[4] - a[13] * b[2] + a[15] * b[0]) * det,
					(a[9] * b[2] - a[8] * b[4] - a[11] * b[0]) * det,
					(a[5] * b[7] - a[4] * b[9] - a[6] * b[6]) * det,
					(a[0] * b[9] - a[1] * b[7] + a[2] * b[6]) * det,
					(a[13] * b[1] - a[12] * b[3] - a[14] * b[0]) * det,
					(a[8] * b[3] - a[9] * b[1] + a[10] * b[0]) * det
				];
				return formatMatrix(outMatrix, 4, 4);
			case 3:
				b[0] = a[8] * a[4] - a[5] * a[7];
				b[1] = -a[8] * a[3] + a[5] * a[6];
				b[2] = a[7] * a[3] - a[4] * a[6];

				det = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
				if(!det) return;
				det = 1.0 / det;

				outMatrix = [
					b[0] * det, (-a[8] * a[1] + a[2] * a[7]) * det, (a[5] * a[1] - a[2] * a[4]) * det,
					b[1] * det, (a[8] * a[0] - a[2] * a[6]) * det, (-a[5] * a[0] + a[2] * a[3]) * det,
					b[2] * det, (-a[7] * a[0] + a[1] * a[6]) * det, (a[4] * a[0] - a[1] * a[3]) * det
				];
				return formatMatrix(outMatrix, 3, 3);
			case 2:
				det = a[0] * a[3] - a[2] * a[1];
				if(!det) return;
				det = 1.0 / det;

				outMatrix = [
					a[3] * det, -a[1] * det,
					-a[2] * det, a[0] * det
				];
				return formatMatrix(outMatrix, 2, 2);
		}
	};

	Matrix.inverseTrans = function(matrix) { // 逆转置矩阵
		if(!(matrix.matrix && matrix.row === matrix.col)) return;
		let a = matrix,
			b = [],
			outMatrix = [],
			det = 0;
		switch (matrix.row) {
			case 4:
				b[0] = a[0] * a[5] - a[1] * a[4];
				b[1] = a[0] * a[6] - a[2] * a[4];
				b[2] = a[0] * a[7] - a[3] * a[4];
				b[3] = a[1] * a[6] - a[2] * a[5];
				b[4] = a[1] * a[7] - a[3] * a[5];
				b[5] = a[2] * a[7] - a[3] * a[6];
				b[6] = a[8] * a[13] - a[9] * a[12];
				b[7] = a[8] * a[14] - a[10] * a[12];
				b[8] = a[8] * a[15] - a[11] * a[12];
				b[9] = a[9] * a[14] - a[10] * a[13];
				b[10] = a[9] * a[15] - a[11] * a[13];
				b[11] = a[10] * a[15] - a[11] * a[14];

				det = b[0] * b[11] - b[1] * b[10] + b[2] * b[9] + b[3] * b[8] - b[4] * b[7] + b[5] * b[6];
				if(!det) return;
				det = 1.0 / det;

				outMatrix = [
					(a[5] * b[11] - a[6] * b[10] + a[7] * b[9]) * det,
					(a[6] * b[8] - a[4] * b[11] - a[7] * b[7]) * det,
					(a[4] * b[10] - a[5] * b[8] + a[7] * b[6]) * det,
					(a[5] * b[7] - a[4] * b[9] - a[6] * b[6]) * det,
					(a[2] * b[10] - a[1] * b[11] - a[3] * b[9]) * det,
					(a[0] * b[11] - a[2] * b[8] + a[3] * b[7]) * det,
					(a[1] * b[8] - a[0] * b[10] - a[3] * b[6]) * det,
					(a[0] * b[9] - a[1] * b[7] + a[2] * b[6]) * det,
					(a[13] * b[5] - a[14] * b[4] + a[15] * b[3]) * det,
					(a[14] * b[2] - a[12] * b[5] - a[15] * b[1]) * det,
					(a[12] * b[4] - a[13] * b[2] + a[15] * b[0]) * det,
					(a[13] * b[1] - a[12] * b[3] - a[14] * b[0]) * det,
					(a[10] * b[4] - a[9] * b[5] - a[11] * b[3]) * det,
					(a[8] * b[5] - a[10] * b[2] + a[11] * b[1]) * det,
					(a[9] * b[2] - a[8] * b[4] - a[11] * b[0]) * det,
					(a[8] * b[3] - a[9] * b[1] + a[10] * b[0]) * det
				];
				return formatMatrix(outMatrix, 4, 4);
			case 3:
				b[0] = a[8] * a[4] - a[5] * a[7];
				b[1] = -a[8] * a[3] + a[5] * a[6];
				b[2] = a[7] * a[3] - a[4] * a[6];

				det = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
				if(!det) return;
				det = 1.0 / det;

				outMatrix = [
					b[0] * det,
					b[1] * det,
					b[2] * det,
					(-a[8] * a[1] + a[2] * a[7]) * det,
					(a[8] * a[0] - a[2] * a[6]) * det,
					(-a[7] * a[0] + a[1] * a[6]) * det,
					(a[5] * a[1] - a[2] * a[4]) * det,
					(-a[5] * a[0] + a[2] * a[3]) * det,
					(a[4] * a[0] - a[1] * a[3]) * det
				];
				return formatMatrix(outMatrix, 3, 3);
			case 2:
				det = a[0] * a[3] - a[2] * a[1];
				if(!det) return;
				det = 1.0 / det;

				outMatrix = [
					a[3] * det, -a[2] * det,
					-a[1] * det, a[0] * det
				];
				return formatMatrix(outMatrix, 2, 2);
		}
	};

	// 向量
	let Vector = {}; // 主要用于二元和三元向量

	Vector.adds = function (vectors) {
		let len = vectors.length,
			vector = vectors[0];
		vector = [vector[0], vector[1], vector[2]];
		for (let i = 1; i < len; i++) {
			let vector2 = vectors[i];
			vector[0] += vector2[0];
			vector[1] += vector2[1];
			if(vector[2] !== undefined) vector[2] += vector2[2];
		}
		return vector;
	};

	Vector.reduces = function (vectors) {
		let len = vectors.length,
			vector = vectors[0];
		vector = [vector[0], vector[1], vector[2]];
		for (let i = 1; i < len; i++) {
			let vector2 = vectors[i];
			vector[0] -= vector2[0];
			vector[1] -= vector2[1];
			if(vector[2] !== undefined) vector[2] -= vector2[2];
		}
		return vector;
	};

	Vector.muls = function (vectors) {
		let len = vectors.length,
			vector = vectors[0];
		vector = [vector[0], vector[1], vector[2]];
		for (let i = 1; i < len; i++) {
			let vector2 = vectors[i];
			vector[0] *= vector2[0];
			vector[1] *= vector2[1];
			vector[2] && (vector[2] *= vector2[2]);
		}
		return vector;
	};

	Vector.divices = function (vectors) {
		let len = vectors.length,
			vector = vectors[0];
		vector = [vector[0], vector[1], vector[2]];
		for (let i = 1; i < len; i++) {
			let vector2 = vectors[i];
			vector[0] = vector2[0] ? vector[0] / vector2[0] : 0;
			vector[1] = vector2[1] ? vector[1] / vector2[1] : 0;
			vector[2] && (vector[2] = vector2[2] ? vector[2] / vector2[2] : 0);
		}
		return vector;
	};

	Vector.transform = function (vector, matrix) {
		let len = vector.length;
		vector[len] = 1;
		let newVector = Matrix.mul(Matrix.makeMatrix([1, vector.length], vector), matrix);
		if (!newVector) return;
		if(len === 2){
			return [newVector[0], newVector[1]];
		}else if(len === 3) {
			return [newVector[0], newVector[1], newVector[2]];
		}
	};

	Vector.module = function (vector) {
		let num = 0,
			len = vector.length;
		while (len--) {
			num += vector[len] ** 2;
		}
		return Math.sqrt(num);
	};

	Vector.normalize = function (vector) {
		let num = this.module(vector),
			len = vector.length;

		while (len--) {
			vector[len] /= num;
		}
		return vector;
	};

	Vector.dot = function (vector1, vector2) {
		return vector1[0] * vector2[0] + vector1[1] * vector2[1] + (vector1[2] ? vector1[2] * vector2[2] : 0);
	};

	Vector.cross = function (vector1, vector2) {
		let a1 = vector1[0], b1 = vector2[0],
			a2 = vector1[1], b2 = vector2[1],
			a3 = vector1[2] || 0, b3 = vector2[2] || 0;
		return[
			a2 * b3 - a3 * b2,
			a3 * b1 - a1 * b3,
			a1 * b2 - a2 * b1
		]
	};

	Vector.angle = function (vector1, vector2) {
		let module = this.module(vector1) * this.module(vector2);
		return Math.acos(module ? this.dot(vector1, vector2) / module : 0) * $Math.ONE;
	};

	this.VMath = {
		ONE: $Math.ONE,
		RADIAN: $Math.RADIAN,
		bezierCurve(points, step, callback) {return bezierCurve(points, step, callback)},
		dotToDeg(dotValue) {return dotToDeg(dotValue)},
		isPowerOf2(num) {return isPowerOf2(num)},
		toDeg(point) {return toDeg(point)},
		toPoint(deg, r) {return toPoint(deg, r)},
		random(min, max) {return random(min, max)},
		rotate(point, deg) {return rotate(point, deg)},
		matrix: {
			add(a, b) {return Matrix.add(a, b)},
			copy(matrix) {return Matrix.copy(matrix)},
			inverse(matrix) {return Matrix.inverse(matrix)},
			inverseTrans(matrix) {return Matrix.inverseTrans(matrix)},
			lookAt(eyePosi, targetPosi, up) {return Matrix.lookAt(eyePosi, targetPosi, up)},
			makeMatrix(size, fill) {return Matrix.makeMatrix(size, fill)},
			makeNumMatrix(size, val) {return Matrix.makeNumMatrix(size, val)},
			makeRotate(deg) {return Matrix.makeRotate(deg)},
			makeRotateX(deg) {return Matrix.makeRotateX(deg)},
			makeRotateY(deg) {return Matrix.makeRotateY(deg)},
			makeRotateZ(deg) {return Matrix.makeRotateZ(deg)},
			makeScale(sx, sy, sz) {return Matrix.makeScale(sx, sy, sz)},
			makeTrans(tx, ty, tz) {return Matrix.makeTrans(tx, ty, tz)},
			mul(a, b) {return Matrix.mul(a, b)},
			muls(matrixArray) {return Matrix.muls(matrixArray)},
			orthogonalProjection(width, height, depth) {return Matrix.orthogonalProjection(width, height, depth)},
			perspectiveProjection(visualAngle, aspectRatio, near, far) {return Matrix.perspectiveProjection(visualAngle, aspectRatio, near, far)},
			perspectiveProjection2(width, height, near, far) {return Matrix.perspectiveProjection2(width, height, near, far)},
			reduce(a, b) {return Matrix.reduce(a, b)},
			transform2D(param) {return Matrix.transform2D(param)},
			transposition(matrix) {return Matrix.transposition(matrix)}
		},
		vector: {
			adds(vectors) {return Vector.adds(vectors)},
			reduces(vectors) {return Vector.reduces(vectors)},
			muls(vectors) {return Vector.muls(vectors)},
			divices(vectors) {return Vector.divices(vectors)},
			transform(vector, matrix) {return Vector.transform(vector, matrix)},
			module(vector) {return Vector.module(vector)},
			normalize(vector) {return Vector.normalize(vector)},
			dot(vector1, vector2) {return Vector.dot(vector1, vector2)},
			cross(vector1, vector2) {return Vector.cross(vector1, vector2)},
			angle(vector1, vector2) {return Vector.angle(vector1, vector2)}
		}
	}
})(Math);
