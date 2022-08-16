function ProcessDB(DBName, Table, Data, Key) {
    return new Promise(function (resolve) {
        // check for IndexedDB support
        if (!window.indexedDB) {
            console.log("Your browser doesn't support IndexedDB");
            return;
        }
        else {
            
            console.log("Your browser support IndexedDB");
            

            //alert(Key);
            // open the CRM database with the version 1
            var request =  indexedDB.open(DBName, 3);

            // create the Contacts object store and indexes
            request.onupgradeneeded = (event) => {

                console.log("On_ProcessDB_Onupgrade");
                var db = event.target.result;
                if (!db.objectStoreNames.contains(Table)) {
                    console.log("On_Insert_Store_not_exists_Creating");
                    var store = db.createObjectStore(Table, { keyPath: Key }
                    );
                    //console.log("now here");
                    // create an index on the email property
                    store.createIndex('UID', 'UID', {
                        unique: true
                    });
                    //store = txn.objectStore(Table);
                }


            }
            // handle the error event
            request.onerror = (event) => {
                console.error('On_ProcessDB_onerror_Database error: ${event.target.errorCode}');
            };

            // handle the success event
            request.onsuccess = (event) => {
                
                console.log("On_ProcessDB_Onsuccess");
                
                insert(event, Table, Data);
            }


        }

      
    });
}


function insert(event,Table,Data) {

    var db = event.target.result;
	var txn = event.target.transaction;
	let store;
    //var txn;
    //const store = txn.objectStore(Table);
      //else {
        //console.log("On_Insert_Store_Exists");
        txn = db.transaction(Table, 'readwrite');
		store = txn.objectStore(Table);
		
	//}
        let query = store.put(Data);
           query.onsuccess = function (event) {
            console.log("On_Insert_Success");
        };

        // handle the error case
        query.onerror = function (event) {
            
            console.log("On_Insert_Error : " + event.target.errorCode);
        };

    // close the database once the 
    // transaction completes
    txn.oncomplete = function () {
        db.close();
    };

}

function getUID(DBName, Table, UID) {

    return new Promise(function (resolve) {


        const request = indexedDB.open(DBName);
        // handle the success event
        request.onsuccess = (event) => {

            console.log("On_getUID_onsuccess");
            getUIDChild(event, Table, UID,resolve);

        };

        request.onupgradeneeded = (event) => {

            console.log("On_getUID_onupgrade");
            getUIDChild(event, Table, UID,resolve);
        }

        request.onerror = (event) => {

            console.log("On_getUID_onerror");
        }


    });

}

function getUIDChild(event, Table, UID, resolve) {
    var SUID;
    var SName;
    let db = event.target.result;
    var SOrgName;
    var Orgid;
	//var txn = event.target.transaction;
    let txn = db.transaction(Table, 'readwrite');
    let store = txn.objectStore(Table);
    const index = store.index('UID');
    // query by indexes
    var query = index.get(UID);

    // return the result object on success
    query.onsuccess = function () {
        console.log("On_getUIDChild_onsuccess");
        SUID = query.result.UID;
        //SName = query.result.profile.firstName + " " + query.result.profile.lastName;
        SName = query.result.profile.firstName;
        Sprovider = query.result.provider;
        
        if (sessionStorage.getItem("flag") == 'b2b') {
            SOrgName = query.result.groups.organizations[0].orgName;
            SUID = SUID + "," + SName + "," + Sprovider + "," + SOrgName;
            Orgid = query.result.groups.organizations[0].orgId;
            var roles = query.result.groups.organizations[0].roles;
            sessionStorage.setItem("OrgID", Orgid);
            sessionStorage.setItem("roles", roles);
            roles.forEach(function (roleid) {
                role = localStorage.getItem(roleid);
                if (role == "Delegated Admin") {
                    sessionStorage.setItem("DACheck", "Yes");
                    
                }

                }
            )}
      
        else
        {
            //SOrgName = query.result.groups.organizations[0].orgName;
            SUID = SUID + "," + SName + "," + Sprovider;
            //alert(SUID);
        }
        console.table(query.result); // result objects
        return resolve(SUID);

    };

    query.onerror = (event) => {
        console.log("On_getUIDChild_onerror : " + event.target.errorCode);
    };

    // close the database connection
    txn.oncomplete = function () {
        db.close();
        //return SUID;
    }
}

function UpdateData(DBName, Table, Data, UID) {
    var request = indexedDB.open(DBName);
        // handle the success event
    request.onsuccess = (event) => {
        console.log("On_UpdateData_onsuccess");
            UpdateDataChild(event, Table, Data);
        }
        request.onerror = (event) => {
            console.log("On_UpdateData_onerror : " + event.target.errorCode);
        };
    request.onupgradeneeded = (event) => {

        console.log("On_UpdateData_onupgrade");
        UpdateDataChild(event, Table, Data);
    }
}
            
function UpdateDataChild(event,Table, Data) {

    let db = event.target.result;
	//var txn = event.target.transaction;
    var transaction = db.transaction(Table, "readwrite");
    var store = transaction.objectStore(Table);
    //alert("ni" + Data);

    let query = store.put(Data);
    console.log("On_UpdateDataChild_Data_Success");
    query.onsuccess = function (event) {



    }

    query.onerror = function (event) {

        console.error("On_UpdateDataChild_onerror : " + event.target.errorCode);

    }

    // close the database connection
    transaction.oncomplete = function () {
        db.close();
        //return SUID;
    }

}




function Delete(DBName, Table, UID) {
    

    return new Promise(function (resolve) {
        var request = indexedDB.open(DBName);
        request.onsuccess = (event) => {

            DeleteChild(event, UID);
        }

        request.onupgradeneeded = (event) => {

            console.log("On_Delete_Onupgrade");
            DeleteChild(event, UID);
        }
        request.onerror = (event) => {

            console.log("On_Delete_Onerror");
        }
    });
}

function DeleteChild(event,UID) {


    let db = event.target.result;
	//var txn = event.target.transaction;
    txn = db.transaction(Table, "readwrite");
    objectStore = txn.objectStore(Table);
    request = objectStore.delete(UID);
    console.log("deleted UID : " + UID);
    request.onsuccess = function (evt) {
        console.log("On_DeleteChild_onsuccess");
        
    };

    request.onerror = function (evt) {
        console.log("On_DeleteChild_onerror : " + event.target.errorCode);

    };
	// close the database connection
    txn.oncomplete = function () {
        db.close();
    };

}

function getRecords(DBName, Table, UID) {
 
    const request = indexedDB.open(DBName);

    // handle the success event
    request.onsuccess = (event) => {
        console.log("On_getRecords_onsuccess");
        getRecorsChild(event,Table, UID);

    };

    request.onupgradeneeded = (event) => {

        console.log("On_getRecords_onupgrade");
        getRecorsChild(event,Table, UID);

    }

    request.onerror = (event) => {

        console.log("On_getRecords_onerror");
        

    }

}

function getRecorsChild(event,Table,UID) {

    let db = event.target.result;
	//var txn= event.target.transaction;
    var txn = db.transaction(Table, 'readonly');
    var store = txn.objectStore(Table);
    const index = store.index('UID');
    // query by indexes
    let query = index.get(UID);

    // return the result object on success
    query.onsuccess = (event) => {

        console.log("On_getRecordsChild_onsuccess");
        var result = event.target.result;
        //alert(result.groups.organizations[0].orgName);
        document.getElementById('UID').value = result.UID;
        document.getElementById('email').innerHTML = result.profile.email;
        document.getElementById('firstName').innerHTML = result.profile.firstName;
        document.getElementById('lastName').innerHTML = result.profile.lastName;
        document.getElementById('phone').innerHTML = result.data.PhoneNumber;
        document.getElementById('address').innerHTML = result.profile.address;
        document.getElementById('city').innerHTML = result.profile.city;
        document.getElementById('state').innerHTML = result.profile.state;
        document.getElementById('zipcode').innerHTML = result.profile.zip;
        document.getElementById('country').innerHTML = result.profile.country;
        var role;
        var rolenames='';
        if (sessionStorage.getItem("flag") == 'b2b') {
            document.getElementById('Organization').innerHTML = result.groups.organizations[0].orgName;
            document.getElementById('Department').innerHTML = result.groups.organizations[0].department;
            document.getElementById('Job').innerHTML = result.groups.organizations[0].job;
            var roles = result.groups.organizations[0].roles;

            roles.forEach(function (roleid) {
                role = localStorage.getItem(roleid);
                role = role + "\n";
                rolenames = rolenames + role;
            });
            document.getElementById('Roles').innerHTML = rolenames;
            

            
            //document.getElementById('Roles').value = result.groups.organizations[0].roles;
        }
            console.dir(result);
        
    };

    query.onerror = (event) => {
        console.log("On_getRecordsChild : " + event.target.errorCode);
    };

    // close the database connection
    txn.oncomplete = function () {
        db.close();
    };



}










        
//(function () {

    

//    // open the CRM database with the version 1
//    const request = indexedDB.open('UserInfo', 1);

//    // create the Contacts object store and indexes
//    request.onupgradeneeded = (event) => {
//        let db = event.target.result;

//        // create the Contacts object store 
//        // with auto-increment id
//        let store = db.createObjectStore('Users', {
//            autoIncrement: false
//        });

//        // create an index on the email property
//        let index = store.createIndex('UID', 'UID', {
//            unique: true
//        });
//    };

//    // handle the error event
//    request.onerror = (event) => {
//        console.error(`Database error: ${event.target.errorCode}`);
//    };

//    // handle the success event
//    request.onsuccess = (event) => {
//        const db = event.target.result;

//        // insert contacts
//        // insertContact(db, {
//        //     email: 'john.doe@outlook.com',
//        //     firstName: 'John',
//        //     lastName: 'Doe'
//        // });

//        // insertContact(db, {
//        //     email: 'jane.doe@gmail.com',
//        //     firstName: 'Jane',
//        //     lastName: 'Doe'
//        // });


//        // get contact by id 1
//        // getContactById(db, 1);


//        // get contact by email
//        // getContactByEmail(db, 'jane.doe@gmail.com');

//        // get all contacts
//        // getAllContacts(db);

//        deleteContact(db, 1);

//    };

    //function insertContact(DBName, Table,Data) {
    //    // create a new transaction
    //    const txn = db.transaction(Table, 'readwrite');

    //    // get the Contacts object store
    //    const store = txn.objectStore(Table);
    //    //
    //    let query = store.put(Table);

    //    // handle success case
    //    query.onsuccess = function (event) {
    //        console.log(event);
    //    };

    //    // handle the error case
    //    query.onerror = function (event) {
    //        console.log(event.target.errorCode);
    //    }

    //    // close the database once the 
    //    // transaction completes
    //    txn.oncomplete = function () {
    //        db.close();
    //    };
    //}


//    function getContactById(db, id) {
//        const txn = db.transaction('Contacts', 'readonly');
//        const store = txn.objectStore('Contacts');

//        let query = store.get(id);

//        query.onsuccess = (event) => {
//            if (!event.target.result) {
//                console.log(`The contact with ${id} not found`);
//            } else {
//                console.table(event.target.result);
//            }
//        };

//        query.onerror = (event) => {
//            console.log(event.target.errorCode);
//        }

//        txn.oncomplete = function () {
//            db.close();
//        };
//    };

//    function getContactByEmail(db, email) {
//        const txn = db.transaction('Contacts', 'readonly');
//        const store = txn.objectStore('Contacts');

//        // get the index from the Object Store
//        const index = store.index('email');
//        // query by indexes
//        let query = index.get(email);

//        // return the result object on success
//        query.onsuccess = (event) => {
//            console.table(query.result); // result objects
//        };

//        query.onerror = (event) => {
//            console.log(event.target.errorCode);
//        }

//        // close the database connection
//        txn.oncomplete = function () {
//            db.close();
//        };
//    }

//    function getAllContacts(db) {
//        const txn = db.transaction('Contacts', "readonly");
//        const objectStore = txn.objectStore('Contacts');

//        objectStore.openCursor().onsuccess = (event) => {
//            let cursor = event.target.result;
//            if (cursor) {
//                let contact = cursor.value;
//                console.log(contact);
//                // continue next record
//                cursor.continue();
//            }
//        };
//        // close the database connection
//        txn.oncomplete = function () {
//            db.close();
//        };
//    }


//    function deleteContact(db, id) {
//        // create a new transaction
//        const txn = db.transaction('Contacts', 'readwrite');

//        // get the Contacts object store
//        const store = txn.objectStore('Contacts');
//        //
//        let query = store.delete(id);

//        // handle the success case
//        query.onsuccess = function (event) {
//            console.log(event);
//        };

//        // handle the error case
//        query.onerror = function (event) {
//            console.log(event.target.errorCode);
//        }

//        // close the database once the 
//        // transaction completes
//        txn.oncomplete = function () {
//            db.close();
//        };

//    }
//})();