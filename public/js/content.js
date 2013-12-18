var ContentStack = function(arr){
  this._storage = [];
  this.getInProgress = false;
};

ContentStack.prototype.getContent = function(cb){
  if(this.length() < 60 && !this.getInProgress){
    this.getInProgress = true;
    $.get('/items',function(data){
      this._storage = this._storage.concat(JSON.parse(data).businesses)
      this.getInProgress = false;
      if(cb && this.length() > 39){
        cb();
      } else if(this.length() < 40){
        this.getContent(cb);
      }
    }.bind(this))
  }
}

ContentStack.prototype.length = function(){
  return this._storage.length;
}

ContentStack.prototype.pop = function(){
  return this._storage.pop();
}

