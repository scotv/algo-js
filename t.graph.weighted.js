(function(type, undefined){

	// shortcut
	// _g, the adjacency list of graph, not this
	// $pt, see wiki

	type.GraphW = function(n, directed){
		if (isNaN(n = +n)) {
			throw new Error(T.ERROR.INVALID_NUMERIC_VALUE);
		}

		// gets a unweighted graph, dafualt is undirected graph
		if (directed !== true){directed = false;}

		Object.defineProperty(this, 'n', {value: n, writable: false});
		Object.defineProperty(this, '__directed__', {value: directed, writable: false});

		// adgList format (each x in adgList): [v, [[v1, w1], [v2, w2], [v3, w3]...]] = [label, [edgeVertexArray]]
		// label can be used for marking visit info
		this.__adjacencyList__ = [];
		this.__v__ = 0;
		this.__e__ = 0;
	};

	$pt = type.GraphW.prototype;
	$pt.v = function(){
		return this.__v__;
	};

	$pt.e = function(){
		return this.__directed__ ? this.__e__ : this.__e__ >> 1;
	};

	$pt.clone = function(){
		var gh = new type.GraphW(this.n, this.__directed__);
		this.__adjacencyList__.forEach(function(x){
			// clone each x in format [v, []]
			// TODO: warning the case in which we push v2 into an empty vertex
			gh.__adjacencyList__[x[0]] = [x[0], x[1].map(function(v){return v.clone();})];
		});

		gh.__v__ = this.__v__;
		gh.__e__ = this.__e__;

		return gh;
	};

	$pt.toString = function(verbose){
		if (verbose !== true) {verbose = false;}

		var count = this.__count__(),
			_g = this.__adjacencyList__,
			str = ['Graph: #n = ' + String(this.n) + ', #v = ' + String(count[0]) + ', #e = ' + String(count[1])];

		if (verbose){
			_g.filter(function(x){return x && x[0] && x[0] > 0}).forEach(function(x){
				str.push(x[0] + ': ' + x[1]
					.filter(function(v){return v>0;})
					.map(function(v){return String(v[0]) + ' (' + String(v[1]) + ')';})
					.join(' '));
			});
		}

		return str.join('\n\r');
	};

	$pt.__pushEdge__ = function(v1, v2, w, bidirectional){
		/// <summary>pushes an edge into thisEdge graph from the v1 to v2.</summary>

		if (isNaN(v1 = +v1) || isNaN(v2 = +v2)) {
			throw new Error(T.ERROR.INVALID_NUMERIC_VALUE);
		}

		var _g = this.__adjacencyList__;

		if (!_g[v1]){ 
			_g[v1] = [v1, []];
			this.__v__++;
		}

		_g[v1][1].push([v2, w]);
		this.__e__++;

		if (!this.__directed__ && bidirectional){
			// if not directed, AND we force bidirectional pusing, 
			// then we push [v2, v1]
			if (!_g[v2]){ 
				_g[v2] = [v2, []];
				this.__v__++;
			}

			_g[v2][1].push([v1, w]);	
			this.__e__++;		
		}
	};

	$pt.__edgesFrom__ = function(v){
		/// <summary>gets the edge sourceing from v.</summary>
		if (isNaN(v = +v)) {
			throw new Error(T.ERROR.INVALID_NUMERIC_VALUE);
		}

		var _g = this.__adjacencyList__;

		if (!_g[v]){ 
			_g[v] = [v, []];
		}

		return _g[v][1];
	};

	$pt.__edgeAt__ = function(k){
		/// <summary>gets a the k-th edge of graph, return the two endpoint.</summary>

		var _g = this.__adjacencyList__,
			p = 0,
			edge = [-1, -1];

		_g.some(function(x){
			return (x && x[0] && x[0]>=0) &&
				x[1].some(function(v){
					if (v>=0 && (p++ == k)){
						edge = [x[0], v];
						return true;
					} else {return false;}
				});
		});

		return edge;
	};

	$pt.__count__ = function(){
		/// <summary>gets the number of vertex and edge.<summary>
		/// <returns type="Array[2]">returns the number of vertex and edge in arr[0] and arr[1].</returns>

		return [this.v(), this.e()];
	};

	$pt.__visiableAt__ = function(v){
		/// <summary>determins whether the v of graph is visiable for visiting or not.</summary>
		if (isNaN(v = +v)) {
			throw new Error(T.ERROR.INVALID_NUMERIC_VALUE);
		}		

		var _g = this.__adjacencyList__;
		return _g[v] && _g[v][0] && _g[v][0] >= 0;
	};

	$pt.__hasEdgesAt__ = function(v){
		/// <summary>determins whether graph has edge(s) sourcing from v or not.</summary>
		if (isNaN(v = +v)) {
			throw new Error(T.ERROR.INVALID_NUMERIC_VALUE);
		}		

		var _g = this.__adjacencyList__;
		return _g[v] && _g[v][1] && _g[v][1].length;
	};	

	$pt.__labelAt__ = function(v, label){
		/// <summary>marks the label to graph, v for its visited or not, 
		/// the default label is false, means we visits the vertex default.
		/// </summary>
		if (isNaN(v = +v)) {
			throw new Error(T.ERROR.INVALID_NUMERIC_VALUE);
		}	

		var _g = this.__adjacencyList__;
		if (!_g[v]) {_g[v]=[v, []];}
		
		if (arguments.length > 1 || label !== undefined){
			_g[v][0] = label;
		}

		return _g[v][0];
	};

	$pt.__visitAt__ = function(v){
		this.__labelAt__(v, -1);
	};

	type.GraphW.__build__ = function(lines){
		var gh,
			info,
			i,
			current,
			vm;

		lines
			.forEach(function(line, i){
				if (i===0){
					gh = new type.GraphW(+line, true)
				} else {
					info = line.split('\t')
						.forEach(function(x, i){
							if (i===0){current = +(x.replace(/^\s\s*/, '').replace(/\s\s*$/, ''));}
							else {
								vm = x.split(',').map(function(x){
									return +(x.replace(/^\s\s*/, '').replace(/\s\s*$/, ''));
								});
								gh.__pushEdge__(current, vm[0], vm[1]);

							}
						});				
				}			
			});

		result = Graph.dijkstra(gh);
		console.log(result);
	};

})(window.T = window.T || {});