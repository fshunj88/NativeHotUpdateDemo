///<reference path="Util.ts" />

namespace Collection {

    // Used internally by dictionary
    export interface IDictionaryPair<K, V> {
        key: K;
        value: V;
    }

    /**
     * Default function to convert an object to a string.
     * @function
     */
    export function defaultDictionaryToString(item: any): string {
        if (item === null) {
            return 'COLLECTION_NULL';
        } else if (Collection.isUndefined(item)) {
            return 'COLLECTION_UNDEFINED';
        } else if (Collection.isString(item)) {
            return '$s' + item;
        } else {
            return '$o' + item.toString();
        }
    }
    
    export class Dictionary<K, V> {

        /**
         * Object holding the key-value pairs.
         * @type {Object}
         * @private
         */
        protected table: { [key: string]: IDictionaryPair<K, V> };
        //: [key: K] will not work since indices can only by strings in javascript and typescript enforces this.
        /**
         * Number of elements in the list.
         * @type {number}
         * @private
         */
        protected nElements: number;

        /**
         * Function used to convert keys to strings.
         * @type {function(Object):string}
         * @protected
         */
        protected toStr: (key: K) => string;


        /**
         * Creates an empty dictionary.
         * @class <p>Dictionaries map keys to values; each key can map to at most one value.
         * This implementation accepts any kind of objects as keys.</p>
         *
         * <p>If the keys are custom objects a function which converts keys to unique
         * strings must be provided. Example:</p>
         * <pre>
         * function petToString(pet) {
         *  return pet.name;
         * }
         * </pre>
         * @constructor
         * @param {function(Object):string=} toStrFunction optional function used
         * to convert keys to strings. If the keys aren't strings or if toString()
         * is not appropriate, a custom function which receives a key and returns a
         * unique string must be provided.
         */
        constructor(toStrFunction?: (key: K) => string) {
            this.table = {};
            this.nElements = 0;
            this.toStr = toStrFunction || defaultDictionaryToString;
        }


        /**
         * Returns the value to which this dictionary maps the specified key.
         * Returns undefined if this dictionary contains no mapping for this key.
         * @param {Object} key key whose associated value is to be returned.
         * @return {*} the value to which this dictionary maps the specified key or
         * undefined if the map contains no mapping for this key.
         */
        getValue(key: K): V | undefined {
            const pair: IDictionaryPair<K, V> = this.table['$' + this.toStr(key)];
            if (Collection.isUndefined(pair)) {
                return undefined;
            }
            return pair.value;
        }


        /**
         * Associates the specified value with the specified key in this dictionary.
         * If the dictionary previously contained a mapping for this key, the old
         * value is replaced by the specified value.
         * @param {Object} key key with which the specified value is to be
         * associated.
         * @param {Object} value value to be associated with the specified key.
         * @return {*} previous value associated with the specified key, or undefined if
         * there was no mapping for the key or if the key/value are undefined.
         */
        setValue(key: K, value: V): V | undefined {

            if (Collection.isUndefined(key) || Collection.isUndefined(value)) {
                return undefined;
            }

            let ret: V | undefined;
            var k = '$' + this.toStr(key);
            const previousElement: IDictionaryPair<K, V> = this.table[k];
            if (Collection.isUndefined(previousElement)) {
                this.nElements++;
                ret = undefined;
            } else {
                ret = previousElement.value;
            }
            this.table[k] = {
                key: key,
                value: value
            };
            return ret;
        }

        /**
         * Removes the mapping for this key from this dictionary if it is present.
         * @param {Object} key key whose mapping is to be removed from the
         * dictionary.
         * @return {*} previous value associated with specified key, or undefined if
         * there was no mapping for key.
         */
        remove(key: K): V | undefined {
            var k = '$' + this.toStr(key);
            var previousElement: IDictionaryPair<K, V> = this.table[k];
            if (!Collection.isUndefined(previousElement)) {
                // delete this.table[k];
                this.table[k] = undefined;
                this.nElements--;
                delete this.table[k];
                return previousElement.value;
            }
            return undefined;
        }

        /**
         * Returns an array containing all of the keys in this dictionary.
         * @return {Array} an array containing all of the keys in this dictionary.
         */
        keys(): K[] {
            var array: K[] = [];
            var name = undefined;
            for (name in this.table) {
                if (Collection.has(this.table, name)) {
                    var pair: IDictionaryPair<K, V> = this.table[name];
                    if (pair !== undefined) {
                        array.push(pair.key);
                    }
                }
            }
            return array;
        }

        /**
         * Returns an array containing all of the values in this dictionary.
         * @return {Array} an array containing all of the values in this dictionary.
         */
        values(): V[] {
            var array: V[] = [];
            var name = undefined;
            for (name in this.table) {
                if (Collection.has(this.table, name)) {
                    var pair: IDictionaryPair<K, V> = this.table[name];
                    if (pair !== undefined) {
                        array.push(pair.value);
                    }
                }
            }
            return array;
        }

        /**
        * Executes the provided function once for each key-value pair
        * present in this dictionary.
        * @param {function(Object,Object):*} callback function to execute, it is
        * invoked with two arguments: key and value. To break the iteration you can
        * optionally return false.
        */
        forEach(callback: (key: K, value: V) => any): void {
            var name = undefined;
            for (name in this.table) {
                if (Collection.has(this.table, name)) {
                    if (this.table[name] == undefined) {
                        continue;
                    }
                    var pair: IDictionaryPair<K, V> = this.table[name];
                    var ret = callback(pair.key, pair.value);
                    if (ret === false) {
                        return;
                    }
                }
            }
        }

        /**
         * Returns true if this dictionary contains a mapping for the specified key.
         * @param {Object} key key whose presence in this dictionary is to be
         * tested.
         * @return {boolean} true if this dictionary contains a mapping for the
         * specified key.
         */
        containsKey(key: K): boolean {
            return !Collection.isUndefined(this.getValue(key));
        }

        /**
        * Removes all mappings from this dictionary.
        * @this {collections.Dictionary}
        */
        clear() {
            this.table = {};
            this.nElements = 0;
        }

        /**
         * Returns the number of keys in this dictionary.
         * @return {number} the number of key-value mappings in this dictionary.
         */
        size(): number {
            return this.nElements;
        }

        /**
         * Returns true if this dictionary contains no mappings.
         * @return {boolean} true if this dictionary contains no mappings.
         */
        isEmpty(): boolean {
            return this.nElements <= 0;
        }

        toString(): string {
            let toret = '{';
            this.forEach((k, v) => {
                toret += `\n\t${k} : ${v}`;
            });
            return toret + '\n}';
        }
    } // End of dictionary

}