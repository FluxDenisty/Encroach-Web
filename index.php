<html>
  <head>
    <title>Canvas tutorial template</title>
    <script type="text/javascript">
      function init() {
        var canvas = document.getElementById('tutorial');
        if (!canvas.getContext){
					return;
        }
        var ctx = canvas.getContext('2d');
				var pallet = ["red","blue","green","orange","yellow","purple"];
				var grid = [];
				for (var i = 0; i < 10; i++){
					grid[i] = [];
					for (var j = 0; j < 10; j++){
						grid[i][j] = Math.floor(Math.random()*6);
					}
				}
				for (var i = 0; i < 10; i++){
					for (var j = 0; j < 10; j++){
						ctx.fillStyle = pallet[grid[i][j]];
						ctx.fillRect(j*20,i*20,20,20);
					}
				}


      }
    </script>
    <style type="text/css">
      canvas { border: 2px solid black; }
    </style>
  </head>
  <body onload="init();">
    <canvas id="tutorial" width="1345" height="500">
			Looks like you don't support canvas.<br />
			<a href="http://www.mozilla.com/en-US/firefox/features/">Download a supporting browser here</a>
		</canvas>

  </body>
</html>

