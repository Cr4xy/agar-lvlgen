/*The MIT License (MIT)
 Copyright (c) 2015 Apostolique
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.*/

var aposBotVersion = 3.645;

Array.prototype.peek = function () {
    return this[this.length - 1];
};

function AposAi() {
    this.name = "AposBot " + aposBotVersion;
    this.player = [];

    this.setPlayer = function (player) {
        this.player = player;
    }

    this.getPlayer = function () {
        return this.player;
    }

    this.setMemoryCells = function (cells) {
        this.cells = cells;
    }

    this.getMemoryCells = function () {
        return this.cells;
    }

    this.getMode = function () {
        return ":ffa";
    }

    // Using mod function instead the prototype directly as it is very slow
    this.mod = function (num, mod) {
        if (mod & (mod - 1) === 0 && mod !== 0) {
            return num & (mod - 1);
        }
        return num < 0 ? ((num % mod) + mod) % mod : num % mod;
    };
    this.splitDistance = 710;

    this.isMerging = function (cell1, cell2) {
        var dist = this.computeDistance(cell1.x, cell1.y, cell2.x, cell2.y, cell1.size, cell2.size);

        //debug logging
        if (false) {
            var params = [cell1.x, cell1.y, cell2.x, cell2.y, cell1.size, cell2.size, dist];
            var debugString = params.join(", ");
            //console.log("Merge:" + debugString);
        }

        return dist <= -50;
    };

    //Given an angle value that was gotten from valueAndleBased(),
    //returns a new value that scales it appropriately.
    this.paraAngleValue = function (angleValue, range) {
        return (15 / (range[1])) * (angleValue * angleValue) - (range[1] / 6);
    };

    this.getMass = function (size) {
        return Math.pow(size / 10, 2);
    };

    this.valueAngleBased = function (angle, range) {
        var leftValue = this.mod(angle - range[0], 360);
        var rightValue = this.mod(this.rangeToAngle(range) - angle, 360);

        var bestValue = Math.min(leftValue, rightValue);

        if (bestValue <= range[1]) {
            return this.paraAngleValue(bestValue, range);
        }
        return -1;
    };

    this.computeDistance = function (x1, y1, x2, y2, s1, s2) {
        // Make sure there are no null optional params.
        s1 = s1 || 0;
        s2 = s2 || 0;
        var xdis = x1 - x2; // <--- FAKE AmS OF COURSE!
        var ydis = y1 - y2;
        var distance = Math.sqrt(xdis * xdis + ydis * ydis) - (s1 + s2);

        return distance;
    };

    // Get a distance that is Inexpensive on the cpu for various purpaces
    this.computeInexpensiveDistance = function (x1, y1, x2, y2, s1, s2) {
        // Make sure there are no null optional params.
        s1 = s1 || 0;
        s2 = s2 || 0;
        var xdis = x1 - x2;
        var ydis = y1 - y2;
        // Get abs quickly
        xdis = xdis < 0 ? xdis * -1 : xdis;
        ydis = ydis < 0 ? ydis * -1 : ydis;

        var distance = xdis + ydis;

        return distance;
    };

    this.compareSize = function (player1, player2, ratio) {
        if (player1.size * player1.size * ratio < player2.size * player2.size) {
            return true;
        }
        return false;
    };
    
    this.canSplit = function (player1, player2) {
        return this.compareSize(player1, player2, 2.8) && !this.compareSize(player1, player2, 20);
    };

    this.isItMe = function (player, cell) {
        if (this.getMode() == ":teams") {
            var currentColor = player[0].color;
            var currentRed = currentColor.substring(1, 3);
            var currentGreen = currentColor.substring(3, 5);
            var currentBlue = currentColor.substring(5, 7);

            var currentTeam = this.getTeam(currentRed, currentGreen, currentBlue);

            var cellColor = cell.color;

            var cellRed = cellColor.substring(1, 3);
            var cellGreen = cellColor.substring(3, 5);
            var cellBlue = cellColor.substring(5, 7);

            var cellTeam = this.getTeam(cellRed, cellGreen, cellBlue);

            if (currentTeam == cellTeam && !cell.virus) {
                return true;
            }

            //console.log("COLOR: " + color);

        } else {
            for (var i = 0; i < player.length; i++) {
                if (cell.id == player[i].id) {
                    return true;
                }
            }
        }
        return false;
    };

    this.getTeam = function (red, green, blue) {
        if (red == "ff") {
            return 0;
        } else if (green == "ff") {
            return 1;
        }
        return 2;
    };

    this.isFood = function (blob, cell) {
        if (!cell.virus && this.compareSize(cell, blob, 1.33) || (cell.size <= 13)) {
            return true;
        }
        return false;
    };

    this.isThreat = function (blob, cell) {

        if (!cell.virus && this.compareSize(blob, cell, 1.30)) {
            return true;
        }
        return false;
    };

    this.isVirus = function (blob, cell) {
        if (blob == null) {
            if (cell.virus) {
                return true;
            } else {
                return false;
            }
        }

        if (cell.virus && this.compareSize(cell, blob, 1.2)) {
            return true;
        } else if (cell.virus && cell.color.substring(3, 5).toLowerCase() != "ff") {
            return true;
        }
        return false;
    };

    this.isSplitTarget = function (that, blob, cell) {
        if (that.canSplit(cell, blob)) {
            return true;
        }
        return false;
    };

    this.getTimeToRemerge = function (mass) {
        return ((mass * 0.02) + 30);
    };

    this.separateListBasedOnFunction = function (that, listToUse, blob) {
        var foodElementList = [];
        var threatList = [];
        var virusList = [];
        var splitTargetList = [];

        var player = this.getPlayer();

        var mergeList = [];

        Object.keys(listToUse).forEach(function (element, index) {
            var isMe = that.isItMe(player, listToUse[element]);

            if (!isMe) {
                if (that.isFood(blob, listToUse[element])/* && listToUse[element].isNotMoving()*/) {
                    //IT'S FOOD!
                    foodElementList.push(listToUse[element]);


                } else if (that.isThreat(blob, listToUse[element])) {
                    //IT'S DANGER!
                    threatList.push(listToUse[element]);
                    mergeList.push(listToUse[element]);
                } else if (that.isVirus(blob, listToUse[element])) {
                    //IT'S VIRUS!
                    virusList.push(listToUse[element]);
                } else if (that.isSplitTarget(that, blob, listToUse[element])) {

                    splitTargetList.push(listToUse[element]);
                    //foodElementList.push(listToUse[element]);
                    mergeList.push(listToUse[element]);
                } else {
                    if (that.isVirus(null, listToUse[element]) == false) {
                        mergeList.push(listToUse[element]);
                    }
                }
            }/*else if(isMe && (getBlobCount(this.getPlayer()) > 0)){
             //Attempt to make the other cell follow the mother one
             foodElementList.push(listToUse[element]);
             }*/
        });

        foodList = [];
        for (var i = 0; i < foodElementList.length; i++) {
            foodList.push([foodElementList[i].x, foodElementList[i].y, foodElementList[i].size]);
        }

        //console.log("Merglist length: " +  mergeList.length)
        //cell merging
        for (var i = 0; i < mergeList.length; i++) {
            for (var z = 0; z < mergeList.length; z++) {
                if (z != i && that.isMerging(mergeList[i], mergeList[z])) { //z != i &&
                    //found cells that appear to be merging - if they constitute a threat add them to the theatlist

                    //clone us a new cell
                    var newThreat = {};
                    var prop;

                    for (prop in mergeList[i]) {
                        newThreat[prop] = mergeList[i][prop];
                    }

                    //average distance and sum the size
                    newThreat.x = (mergeList[i].x + mergeList[z].x) / 2;
                    newThreat.y = (mergeList[i].y + mergeList[z].y) / 2;
                    newThreat.size = (mergeList[i].size + mergeList[z].size);
                    newThreat.nopredict = true;
                    //check its a threat
                    if (that.isThreat(blob, newThreat)) {
                        //IT'S DANGER!
                        threatList.push(newThreat);
                    }

                }
            }
        }

        return [foodList, threatList, virusList, splitTargetList];
    };

    this.getAll = function (blob) {
        var dotList = [];
        var player = this.getPlayer();
        var interNodes = this.getMemoryCells();

        dotList = this.separateListBasedOnFunction(this, interNodes, blob);

        return dotList;
    };

    this.clusterFood = function (foodList, blobSize) {
        var clusters = [];
        var addedCluster = false;

        //1: x
        //2: y
        //3: size or value
        //4: Angle, not set here.

        for (var i = 0; i < foodList.length; i++) {
            for (var j = 0; j < clusters.length; j++) {
                if (this.computeInexpensiveDistance(foodList[i][0], foodList[i][1], clusters[j][0], clusters[j][1]) < blobSize * 2) {
                    clusters[j][0] = (foodList[i][0] + clusters[j][0]) / 2;
                    clusters[j][1] = (foodList[i][1] + clusters[j][1]) / 2;
                    clusters[j][2] += foodList[i][2];
                    addedCluster = true;
                    break;
                }
            }
            if (!addedCluster) {
                clusters.push([foodList[i][0], foodList[i][1], foodList[i][2], 0]);
            }
            addedCluster = false;
        }
        return clusters;
    };

    this.getAngle = function (x1, y1, x2, y2) {
        //Handle vertical and horizontal lines.
        //calculate angle opposite of enemy

        if (x1 == x2) {
            if (y1 < y2) {
                return 271;
                //return 89;
            } else {
                return 89;
            }
        }

        return (Math.round(Math.atan2(y1 - y2, x1 - x2) / Math.PI * 180));
    };

    this.slope = function (x1, y1, x2, y2) {
        var m = (y1 - y2) / (x1 - x2);

        return m;
    };

    this.slopeFromAngle = function (degree) {
        if (degree == 270) {
            degree = 271;
        } else if (degree == 90) {
            degree = 91;
        }
        return Math.tan((degree - 180) / 180 * Math.PI);
    };

    //Given two points on a line, finds the slope of a perpendicular line crossing it.
    this.inverseSlope = function (x1, y1, x2, y2) {
        var m = this.slope(x1, y1, x2, y2);
        return (-1) / m;
    };

    //Given a slope and an offset, returns two points on that line.
    this.pointsOnLine = function (slope, useX, useY, distance) {
        var b = useY - slope * useX;
        var r = Math.sqrt(1 + slope * slope);

        var newX1 = (useX + (distance / r));
        var newY1 = (useY + ((distance * slope) / r));
        var newX2 = (useX + ((-distance) / r));
        var newY2 = (useY + (((-distance) * slope) / r));

        return [
            [newX1, newY1],
            [newX2, newY2]
        ];
    };

    this.followAngle = function (angle, useX, useY, distance) {
        var slope = this.slopeFromAngle(angle);
        var coords = this.pointsOnLine(slope, useX, useY, distance);

        var side = this.mod(angle - 90, 360);
        if (side < 180) {
            return coords[1];
        } else {
            return coords[0];
        }
    };

    //Using a line formed from point a to b, tells if point c is on S side of that line.
    this.isSideLine = function (a, b, c) {
        if ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) > 0) {
            return true;
        }
        return false;
    };

    //angle range2 is within angle range2
    //an Angle is a point and a distance between an other point [5, 40]
    this.angleRangeIsWithin = function (range1, range2) {
        if (range2[0] == this.mod(range2[0] + range2[1], 360)) {
            return true;
        }
        //console.log("r1: " + range1[0] + ", " + range1[1] + " ... r2: " + range2[0] + ", " + range2[1]);

        var distanceFrom0 = this.mod(range1[0] - range2[0], 360);
        var distanceFrom1 = this.mod(range1[1] - range2[0], 360);

        if (distanceFrom0 < range2[1] && distanceFrom1 < range2[1] && distanceFrom0 < distanceFrom1) {
            return true;
        }
        return false;
    };

    this.angleRangeIsWithinInverted = function (range1, range2) {
        var distanceFrom0 = this.mod(range1[0] - range2[0], 360);
        var distanceFrom1 = this.mod(range1[1] - range2[0], 360);

        if (distanceFrom0 < range2[1] && distanceFrom1 < range2[1] && distanceFrom0 > distanceFrom1) {
            return true;
        }
        return false;
    };

    this.angleIsWithin = function (angle, range) {
        var diff = this.mod(this.rangeToAngle(range) - angle, 360);
        if (diff >= 0 && diff <= range[1]) {
            return true;
        }
        return false;
    };

    this.rangeToAngle = function (range) {
        return this.mod(range[0] + range[1], 360);
    };

    this.anglePair = function (range) {
        return (range[0] + ", " + this.rangeToAngle(range) + " range: " + range[1]);
    };

    //TODO: Don't let this function do the radius math.
    this.getEdgeLinesFromPoint = function (blob1, blob2, radius) {
        var px = blob1.x;
        var py = blob1.y;

        var cx = blob2.x;
        var cy = blob2.y;

        //var radius = blob2.size;

        /*if (blob2.virus) {
         radius = blob1.size;
         } else if(canSplit(blob1, blob2)) {
         radius += splitDistance;
         } else {
         radius += blob1.size * 2;
         }*/

        var shouldInvert = false;

        var tempRadius = this.computeDistance(px, py, cx, cy);
        if (tempRadius <= radius) {
            radius = tempRadius - 5;
            shouldInvert = true;
        }

        var dx = cx - px;
        var dy = cy - py;
        var dd = Math.sqrt(dx * dx + dy * dy);
        var a = Math.asin(radius / dd);
        var b = Math.atan2(dy, dx);

        var t = b - a;
        var ta = {
            x: radius * Math.sin(t),
            y: radius * -Math.cos(t)
        };

        t = b + a;
        var tb = {
            x: radius * -Math.sin(t),
            y: radius * Math.cos(t)
        };

        var angleLeft = this.getAngle(cx + ta.x, cy + ta.y, px, py);
        var angleRight = this.getAngle(cx + tb.x, cy + tb.y, px, py);
        var angleDistance = this.mod(angleRight - angleLeft, 360);

        /*if (shouldInvert) {
         var temp = angleLeft;
         angleLeft = this.mod(angleRight + 180, 360);
         angleRight = this.mod(temp + 180, 360);
         angleDistance = this.mod(angleRight - angleLeft, 360);
         }*/

        return [angleLeft, angleDistance, [cx + tb.x, cy + tb.y],
            [cx + ta.x, cy + ta.y]
        ];
    };

    this.invertAngle = function (range) { // Where are you getting all of these vars from? (badAngles and angle)
        var angle1 = this.rangeToAngle(badAngles[i]);
        var angle2 = this.mod(badAngles[i][0] - angle, 360);
        return [angle1, angle2];
    };

    /*
     this.addWall = function(listToUse, blob) {
     //var mapSizeX = Math.abs(f.getMapStartX - f.getMapEndX);
     //var mapSizeY = Math.abs(f.getMapStartY - f.getMapEndY);
     //var distanceFromWallX = mapSizeX/3;
     //var distanceFromWallY = mapSizeY/3;
     var distanceFromWallY = 2000;
     var distanceFromWallX = 2000;
     if (blob.x < getMapStartX() + distanceFromWallX) {
     //LEFT
     //console.log("Left");
     listToUse.push([
     [115, true],
     [245, false], this.computeInexpensiveDistance(getMapStartX(), blob.y, blob.x, blob.y)
     ]);
     }
     if (blob.y < getMapStartY() + distanceFromWallY) {
     //TOP
     //console.log("TOP");
     listToUse.push([
     [205, true],
     [335, false], this.computeInexpensiveDistance(blob.x, getMapStartY(), blob.x, blob.y)
     ]);
     }
     if (blob.x > getMapEndX() - distanceFromWallX) {
     //RIGHT
     //console.log("RIGHT");
     listToUse.push([
     [295, true],
     [65, false], this.computeInexpensiveDistance(getMapEndX(), blob.y, blob.x, blob.y)
     ]);
     }
     if (blob.y > getMapEndY() - distanceFromWallY) {
     //BOTTOM
     //console.log("BOTTOM");
     listToUse.push([
     [25, true],
     [155, false], this.computeInexpensiveDistance(blob.x, getMapEndY(), blob.x, blob.y)
     ]);
     }
     return listToUse;
     };
     */

    //listToUse contains angles in the form of [angle, boolean].
    //boolean is true when the range is starting. False when it's ending.
    //range = [[angle1, true], [angle2, false]]

    this.getAngleIndex = function (listToUse, angle) {
        if (listToUse.length === 0) {
            return 0;
        }

        for (var i = 0; i < listToUse.length; i++) {
            if (angle <= listToUse[i][0]) {
                return i;
            }
        }

        return listToUse.length;
    };

    this.addAngle = function (listToUse, range) {
        //#1 Find first open element
        //#2 Try to add range1 to the list. If it is within other range, don't add it, set a boolean.
        //#3 Try to add range2 to the list. If it is withing other range, don't add it, set a boolean.

        //TODO: Only add the new range at the end after the right stuff has been removed.

        var newListToUse = listToUse.slice();

        var startIndex = 1;

        if (newListToUse.length > 0 && !newListToUse[0][1]) {
            startIndex = 0;
        }

        var startMark = this.getAngleIndex(newListToUse, range[0][0]);
        var startBool = this.mod(startMark, 2) != startIndex;

        var endMark = this.getAngleIndex(newListToUse, range[1][0]);
        var endBool = this.mod(endMark, 2) != startIndex;

        var removeList = [];

        if (startMark != endMark) {
            //Note: If there is still an error, this would be it.
            var biggerList = 0;
            if (endMark == newListToUse.length) {
                biggerList = 1;
            }

            for (var i = startMark; i < startMark + this.mod(endMark - startMark, newListToUse.length + biggerList); i++) {
                removeList.push(this.mod(i, newListToUse.length));
            }
        } else if (startMark < newListToUse.length && endMark < newListToUse.length) {
            var startDist = this.mod(newListToUse[startMark][0] - range[0][0], 360);
            var endDist = this.mod(newListToUse[endMark][0] - range[1][0], 360);

            if (startDist < endDist) {
                for (var i = 0; i < newListToUse.length; i++) {
                    removeList.push(i);
                }
            }
        }

        removeList.sort(function (a, b) {
            return b - a;
        });

        for (var i = 0; i < removeList.length; i++) {
            newListToUse.splice(removeList[i], 1);
        }

        if (startBool) {
            newListToUse.splice(this.getAngleIndex(newListToUse, range[0][0]), 0, range[0]);
        }
        if (endBool) {
            newListToUse.splice(this.getAngleIndex(newListToUse, range[1][0]), 0, range[1]);
        }

        return newListToUse;
    };

    this.getAngleRange = function (blob1, blob2, radius) {
        var angleStuff = this.getEdgeLinesFromPoint(blob1, blob2, radius);

        var leftAngle = angleStuff[0];
        var rightAngle = this.rangeToAngle(angleStuff);
        var difference = angleStuff[1];

        //console.log("Adding badAngles: " + leftAngle + ", " + rightAngle + " diff: " + difference);
        return [leftAngle, difference];
    };

    //Given a list of conditions, shift the angle to the closest available spot respecting the range given.
    this.shiftAngle = function (listToUse, angle, range) {
        //TODO: shiftAngle needs to respect the range! DONE?
        for (var i = 0; i < listToUse.length; i++) {
            if (this.angleIsWithin(angle, listToUse[i])) {
                //console.log("Shifting needed!");

                var angle1 = listToUse[i][0];
                var angle2 = this.rangeToAngle(listToUse[i]);

                var dist1 = this.mod(angle - angle1, 360);
                var dist2 = this.mod(angle2 - angle, 360);

                if (dist1 < dist2) {
                    if (this.angleIsWithin(angle1, range)) {
                        return angle1;
                    } else {
                        return angle2;
                    }
                } else {
                    if (this.angleIsWithin(angle2, range)) {
                        return angle2;
                    } else {
                        return angle1;
                    }
                }
            }
        }
        //console.log("No Shifting Was needed!");
        return angle;
    };

    /**
     * This is the main bot logic. This is called quite often.
     * This is what we need to modify
     * @return A 2 dimensional array with coordinates for every cells.  [[x, y], [x, y]]
     */
    this.mainLoop = function () {
        var player = this.getPlayer();
        tempPoint = [0, 0, 1];

        //This variable will be returned at the end.
        //It will contain the destination choices for all the cells.
        //BTW!!! ERROR ERROR ABORT MISSION!!!!!!! READ BELOW -----------
        //
        //SINCE IT'S STUPID NOW TO ASK EACH CELL WHERE THEY WANT TO GO,
        //THE BOT SHOULD SIMPLY PICK ONE AND THAT'S IT, I MEAN WTF....
        var destinationChoices = []; //destination, size, danger


        //Just to make sure the player is alive.
        if (player.length > 0) {
            //Loops only for one cell for now.
            for (var k = 0; /*k < player.length*/ k < 1; k++) {
                //console.log("Working on blob: " + k);

                //var allDots = processEverything(interNodes);

                //loop through everything that is on the screen and
                //separate everything in it's own category.
                var allIsAll = this.getAll(player[k]);

                //The food stored in element 0 of allIsAll
                var allPossibleFood = allIsAll[0];
                //The threats are stored in element 1 of allIsAll
                var allPossibleThreats = allIsAll[1];
                //The viruses are stored in element 2 of allIsAll
                var allPossibleViruses = allIsAll[2];

                //The bot works by removing angles in which it is too
                //dangerous to travel towards to.
                var badAngles = [];
                var obstacleList = [];
                var clusterAllFood = this.clusterFood(allPossibleFood, player[k].size);

                //console.log("Looking for enemies!");

                //Loop through all the cells that were identified as threats.
                for (var i = 0; i < allPossibleThreats.length; i++) {
                    allPossibleThreats[i].enemyDist = this.computeDistance(allPossibleThreats[i].x, allPossibleThreats[i].y, player[k].x, player[k].y, allPossibleThreats[i].size, player[k].size);
                    //var splitDangerDistance = allPossibleThreats[i].size + this.splitDistance;
                    var splitDangerDistance = 200;//this.splitDistance;
                    var normalDangerDistance = 150;
                    var shiftDistance = player[k].size;

                    //console.log("Found distance.");
                    var enemyCanSplit = this.canSplit(player[k], allPossibleThreats[i]);
                    var secureDistance = (enemyCanSplit ? splitDangerDistance : normalDangerDistance);

                    for (var j = clusterAllFood.length - 1; j >= 0; j--) {
                        if (this.computeDistance(allPossibleThreats[i].x, allPossibleThreats[i].y, clusterAllFood[j][0], clusterAllFood[j][1]) < secureDistance + shiftDistance)
                            clusterAllFood.splice(j, 1);
                    }
                    //can split on you, DANGER
                    //TODO: all this is doing is calculating angles that you need to go into the opposite direction of... we need better logic than that.
                    if ((enemyCanSplit && allPossibleThreats[i].enemyDist < splitDangerDistance)) {
                        badAngles.push(this.getAngleRange(player[k], allPossibleThreats[i], splitDangerDistance).concat(allPossibleThreats[i].enemyDist));
                    //can't split on you, but still DANGEROUS
                    } else if ((!enemyCanSplit && allPossibleThreats[i].enemyDist < normalDangerDistance)) {
                        badAngles.push(this.getAngleRange(player[k], allPossibleThreats[i], normalDangerDistance).concat(allPossibleThreats[i].enemyDist));

                    } else if (enemyCanSplit && allPossibleThreats[i].enemyDist < splitDangerDistance + shiftDistance) {
                        var tempOb = this.getAngleRange(player[k], allPossibleThreats[i], splitDangerDistance + shiftDistance);
                        var angle1 = tempOb[0];
                        var angle2 = this.rangeToAngle(tempOb);

                        obstacleList.push([[angle1, true], [angle2, false]]);
                    } else if (!enemyCanSplit && allPossibleThreats[i].enemyDist < normalDangerDistance + shiftDistance) {
                        var tempOb = this.getAngleRange(player[k], allPossibleThreats[i], normalDangerDistance + shiftDistance);
                        var angle1 = tempOb[0];
                        var angle2 = this.rangeToAngle(tempOb);

                        obstacleList.push([[angle1, true], [angle2, false]]);
                    }
                    //console.log("Done with enemy: " + i);
                }

                //console.log("Done looking for enemies!");

                var goodAngles = [];
                var stupidList = [];

                for (var i = 0; i < allPossibleViruses.length; i++) {
                    var virusDistance = this.computeDistance(allPossibleViruses[i].x, allPossibleViruses[i].y, player[k].x, player[k].y);
                    if (player[k].size < allPossibleViruses[i].size) {
                        if (virusDistance < (allPossibleViruses[i].size * 2)) {
                            var tempOb = this.getAngleRange(player[k], allPossibleViruses[i], allPossibleViruses[i].size + 10);
                            var angle1 = tempOb[0];
                            var angle2 = this.rangeToAngle(tempOb);
                            obstacleList.push([[angle1, true], [angle2, false]]);
                        }
                    } else {
                        if (virusDistance < (player[k].size * 2)) {
                            var tempOb = this.getAngleRange(player[k], allPossibleViruses[i], player[k].size + 50);
                            var angle1 = tempOb[0];
                            var angle2 = this.rangeToAngle(tempOb);
                            obstacleList.push([[angle1, true], [angle2, false]]);
                        }
                    }
                }

                if (badAngles.length > 0) {
                    //console.log(badAngles);
                    //NOTE: This is only bandaid wall code. It's not the best way to do it.
                    //stupidList = this.addWall(stupidList, player[k]);
                }

                for (var i = 0; i < badAngles.length; i++) {
                    var angle1 = badAngles[i][0];
                    var angle2 = this.rangeToAngle(badAngles[i]);
                    stupidList.push([[angle1, true], [angle2, false], badAngles[i][2]]);
                }

                //stupidList.push([[45, true], [135, false]]);
                //stupidList.push([[10, true], [200, false]]);

                stupidList.sort(function (a, b) {
                    //console.log("Distance: " + a[2] + ", " + b[2]);
                    return a[2] - b[2];
                });

                //console.log("Added random noob stuff.");

                var sortedInterList = [];
                var sortedObList = [];

                for (var i = 0; i < stupidList.length; i++) {
                    //console.log("Adding to sorted: " + stupidList[i][0][0] + ", " + stupidList[i][1][0]);
                    var tempList = this.addAngle(sortedInterList, stupidList[i]);

                    if (tempList.length === 0) {
                        //console.log("MAYDAY IT'S HAPPENING!");
                        break;
                    } else {
                        sortedInterList = tempList;
                    }
                }

                for (var i = 0; i < obstacleList.length; i++) {
                    sortedObList = this.addAngle(sortedObList, obstacleList[i]);

                    if (sortedObList.length === 0) {
                        break;
                    }
                }

                var offsetI = 0;
                var obOffsetI = 1;

                if (sortedInterList.length > 0 && sortedInterList[0][1]) {
                    offsetI = 1;
                }
                if (sortedObList.length > 0 && sortedObList[0][1]) {
                    obOffsetI = 0;
                }

                var obstacleAngles = [];

                for (var i = 0; i < sortedInterList.length; i += 2) {
                    //console.log(sortedInterList);
                    var angle1 = sortedInterList[this.mod(i + offsetI, sortedInterList.length)][0];
                    var angle2 = sortedInterList[this.mod(i + 1 + offsetI, sortedInterList.length)][0];
                    var diff = this.mod(angle2 - angle1, 360);
                    goodAngles.push([angle1, diff]);
                }

                for (var i = 0; i < sortedObList.length; i += 2) {
                    var angle1 = sortedObList[this.mod(i + obOffsetI, sortedObList.length)][0];
                    var angle2 = sortedObList[this.mod(i + 1 + obOffsetI, sortedObList.length)][0];
                    var diff = this.mod(angle2 - angle1, 360);
                    obstacleAngles.push([angle1, diff]);
                }

                if (goodAngles.length > 0) {
                    //console.log("good angles");
                    var bIndex = goodAngles[0];
                    var biggest = goodAngles[0][1];
                    for (var i = 1; i < goodAngles.length; i++) {
                        var size = goodAngles[i][1];
                        if (size > biggest) {
                            biggest = size;
                            bIndex = goodAngles[i];
                        }
                    }
                    var perfectAngle = this.mod(bIndex[0] + bIndex[1] / 2, 360);
                    perfectAngle = this.shiftAngle(obstacleAngles, perfectAngle, bIndex);
                    var line1 = this.followAngle(perfectAngle, player[k].x, player[k].y, 99999/*verticalDistance()*/);
                    destinationChoices = line1;
                } else if (clusterAllFood.length > 0) {
                    //console.log("good angles is 0, but there is food");
                    for (var i = 0; i < clusterAllFood.length; i++) {
                        //This is the cost function. Higher is better.
                        var clusterAngle = this.getAngle(clusterAllFood[i][0], clusterAllFood[i][1], player[k].x, player[k].y);
                        clusterAllFood[i][2] = clusterAllFood[i][2] * 6 - this.computeDistance(clusterAllFood[i][0], clusterAllFood[i][1], player[k].x, player[k].y);
                        clusterAllFood[i][3] = clusterAngle;
                    }

                    var bestFoodI = 0;
                    var bestFood = clusterAllFood[0][2];
                    for (var i = 1; i < clusterAllFood.length; i++) {
                        if (bestFood < clusterAllFood[i][2]) {
                            bestFood = clusterAllFood[i][2];
                            bestFoodI = i;
                        }
                    }

                    //console.log("Best Value: " + clusterAllFood[bestFoodI][2]);
                    var distance = this.computeDistance(player[k].x, player[k].y, clusterAllFood[bestFoodI][0], clusterAllFood[bestFoodI][1]);
                    var shiftedAngle = this.shiftAngle(obstacleAngles, this.getAngle(clusterAllFood[bestFoodI][0], clusterAllFood[bestFoodI][1], player[k].x, player[k].y), [0, 360]);
                    var destination = this.followAngle(shiftedAngle, player[k].x, player[k].y, distance);
                    destinationChoices = destination;
                }
                tempPoint[2] = 1;
                //console.log("Done working on blob: " + i);
            }
        }
        return destinationChoices;
    };
}
;
module.exports = AposAi;