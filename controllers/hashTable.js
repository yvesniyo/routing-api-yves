var HashTable = function() {
    this._storage = [];
    this._count = 0;
    this._limit = 8;
  }
  
  
  HashTable.prototype.insert = function(key, value) {
    var index = this.hashFunc(key, this._limit);
    var bucket = this._storage[index]
    if (!bucket) {
      var bucket = [];
      this._storage[index] = bucket;
    }
  
    var override = false;
    for (var i = 0; i < bucket.length; i++) {
      var tuple = bucket[i];
      if (tuple[0] === key) {
        tuple[1] = value;
        override = true;
      }
    }
  
    if (!override) {
      bucket.push([key, value]);
      this._count++
        if (this._count > this._limit * 0.75) {
          this.resize(this._limit * 2);
        }
    }
    return this;
  };
  
  
  HashTable.prototype.remove = function(key) {
    var index = this.hashFunc(key, this._limit);
    var bucket = this._storage[index];
    if (!bucket) {
      return null;
    }
    for (var i = 0; i < bucket.length; i++) {
      var tuple = bucket[i];
      if (tuple[0] === key) {
        bucket.splice(i, 1);
        this._count--;
        if (this._count < this._limit * 0.25) {
          this.resize(this._limit / 2);
        }
        return tuple[1];
      }
    }
  };
  
  
  
  HashTable.prototype.retrieve = function(key) {
    var index = this.hashFunc(key, this._limit);
    var bucket = this._storage[index];
    if (!bucket) {
      return null;
    }
    for (var i = 0; i < bucket.length; i++) {
      var tuple = bucket[i];
      if (tuple[0] === key) {
        return tuple[1];
      }
    }
    return null;
  };
  
  
  HashTable.prototype.hashFunc = function(str, max) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var letter = str[i];
      hash = (hash << 5) + letter.charCodeAt(0);
      hash = (hash & hash) % max;
    }
    return hash;
  };
  
  
  HashTable.prototype.resize = function(newLimit) {
    var oldStorage = this._storage;
    this._limit = newLimit;
    this._count = 0;
    this._storage = [];
    oldStorage.forEach(function(bucket) {
      if (!bucket) {
        return;
      }
      for (var i = 0; i < bucket.length; i++) {
        var tuple = bucket[i];
        this.insert(tuple[0], tuple[1]);
      }
    }.bind(this));
  };
  HashTable.prototype.retrieveAll = function() {
    console.log(this._storage);
    console.log(this._limit);
  };
    // // module.exports = {
  // //   HashTable : HashTable,
  // //   name : "yves"
  // // };

  // exports.name ="yves";
  // exports.HashTable = HashTable;
  module.exports = HashTable;
  