// Bowlful, a pet tracking app
// Copyright 2016, Carter T. Konz

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('bowlful', ['ionic', 'LocalStorageModule', 'ngCordova', 'ngMessages']);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

app.config(function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('bowlful');
});

app.controller('main', function ($scope, $ionicModal, localStorageService, $ionicPopup, $filter, $ionicSideMenuDelegate, $ionicActionSheet, $ionicListDelegate, $cordovaCamera) {
  //store the entities name in a variable var petData = 'pet';
  var petData = [];

  //initialize the pets scope with empty array
  $scope.pets = [];
  $scope.undoToggle = 0;

  //initialize the pet scope with empty object
  $scope.resetPet = function (index) {
    $scope.pet = {
      feedLog: [],
      feedStatus: 0,
      kind : {
        text : "Dog"
      }
    };
    $scope.selectedPet = "Dog";
  };

  $scope.resetPet();

  $scope.newPetOptions = {
    kind: [
      {text: "Dog"},
      {text: "Cat"},
      {text: "Bird"}
    ]
  };



  $scope.toggleLeftSideMenu = function () {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.photoActionSheet = function() {

    // Show the action sheet
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Image from <b>Camera</b>' },
        { text: 'Image from <b>Library</b>' }
      ],
      cancelText: 'Cancel',
      cancel: function() {
           // add cancel code..
         },
      buttonClicked: function(index) {
        //camera
        if (index==0){
          $scope.getPhoto(true);
        }
        //library
        if (index==1){
          $scope.getPhoto(false);
        }
        return true;
      }
    });

    // For example's sake, hide the sheet after two seconds
    $timeout(function() {
      hideSheet();
    }, 2000);

  };

  $scope.getPhoto = function(camera) {
    function onSuccess(imageData) {
      console.log('success - js call');
      //JS selector call is slightly faster...
      $scope.pet.img = imageData;
    }

    function onFail(message) {
      // showAlert = function() {
      //   var alertPopup = $ionicPopup.alert({
      //     title: 'Cancelled',
      //     template: 'Photo upload cancelled, please try again.'
      //   });
      //
      //   alertPopup.then(function(res) {
      //   //after popup controls
      //   });
      // };
      // showAlert();
      console.log("Photo upload cancelled.");
    }

    if (camera === true) {
      //Use from Camera
        navigator.camera.getPicture(onSuccess, onFail, {
          quality: 50,
          correctOrientation: true,
          sourceType: Camera.PictureSourceType.CAMERA,
          destinationType: Camera.DestinationType.FILE_URI
        });
    }
    else {
      navigator.camera.getPicture(onSuccess, onFail, {
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        destinationType: Camera.DestinationType.FILE_URI
      });
    }
  };

  //configure the ionic modal before use
  $ionicModal.fromTemplateUrl('new-pet-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
  }).then(function (modal) {
      $scope.newPetModal = modal;
  });


  $ionicModal.fromTemplateUrl('edit-pet-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
  }).then(function (modal) {
      $scope.editPetModal = modal;
  });
  // $ionicModal.fromTemplateUrl('add-photo-action-sheet.html', {
  //     scope: $scope,
  //     animation: 'slide-in-up'
  // }).then(function (modal) {
  //     $scope.addPhotoActionSheet = modal;
  // });

  $scope.getPets = function () {
      //fetches pets from local storage
      if (localStorageService.get(petData)) {
        $scope.pets = localStorageService.get(petData);
      } else {
        $scope.pets = [];
      }
  };

  $scope.createPet = function () {
      //creates a new pet
      var index = $scope.pets.length;
      if (!$scope.pet.img) {
        $scope.pet.img = 'img/ionic.png';
      }
      $scope.pet.kind = {
        text : $scope.selectedPet
      };
      if ($scope.pet.feedStatus == 0){
        $scope.feedPet(index);
      }
      else {
      }
      // $scope.pets.img = $scope.pets.kind + '.png';
      // $scope.pet.img = 'img/ionic.png';
      $scope.pets.push($scope.pet);

      localStorageService.set(petData, $scope.pets);
      $scope.resetPet();
      // refresh pets list
      $scope.getPets();
      //close new pet modal
      $scope.newPetModal.hide();
  };

  $scope.editPet = function (index) {

      //creates a new pet
      if (!$scope.pet.img) {
        $scope.pet.img = 'img/ionic.png';
      }
      $scope.pet.kind = {
        text : $scope.selectedPet
      };
      // $scope.pets.img = $scope.pets.kind + '.png';
      // $scope.pet.img = 'img/ionic.png';
      $scope.pets[index] = $scope.pet;
      localStorageService.set(petData, $scope.pets);
      $scope.resetPet();
      // refresh pets list
      $ionicListDelegate.closeOptionButtons();
      $scope.getPets();
      //close new pet modal
      $scope.editPetModal.hide();
  };

  $scope.removePet = function (index) {
      //removes a pet
      $scope.pets.splice(index, 1);
      console.log("Pet " + index + " removed.");
      localStorageService.set(petData, $scope.pets);
      $scope.getPets();
      $ionicListDelegate.closeOptionButtons();
  };

  $scope.petDialog = function(index) {
    $ionicListDelegate.closeOptionButtons();
    var lastFed;
    if ($scope.pets[index].feedLog[0]) {
      var current = $scope.pets[index].currentFeed;
      lastFed = 'Last fed: ' + $filter('date')($scope.pets[index].feedLog[current], 'MMM d, h:mm a');
    }
    else {
      lastFed = 'Never';
    }
    var petPopup = $ionicPopup.show({
      title: $scope.pets[index].name,
      subTitle: lastFed,
      buttons: [
        { text: 'Back' },
        {
          text: 'More',
          onTap: function(e) {
            $scope.petOptions(index);
          }
        },
        {
          text: '<b>Feed</b>',
          type: 'button-positive',
          onTap: function(e) {
            $scope.feedPet(index);
          }
        }
      ]
    });
  };

  $scope.petOptions = function(index) {
    var petOptionsPopup = $ionicPopup.show({
      title: $scope.pets[index].name + ' – More',
      buttons: [
        { text: 'Back' },
        {
          text: 'Undo',
          type: 'button-energized',
          onTap: function(e) {
            $scope.undoFeed(index);
          }
        },
        {
          text: 'Clear',
          type: 'button-assertive',
          onTap: function(e) {
            $scope.removePet(index);
          }
        }
      ]
    });
  };

  $scope.updatePetFeed = function(pet) {
    pet.feedLog.push(new Date());
    pet.feedStatus = 0;
    pet.currentFeed += 1;
    return pet;
  };


  $scope.feedPet = function (index) {
      $ionicListDelegate.closeOptionButtons();
      //updates a pet as fed
      var pet = $scope.pets[index];
      // $scope.pet = $scope.pets[index];
      if (pet) {
        if (pet.feedLog[0]) {
          pet = $scope.updatePetFeed(pet);
        }
        else if (pet.feedLog == []) {
          var current = pet.feedLog.length;
          pet.feedLog[current] = new Date();
          pet.feedStatus = 0;
          pet.currentFeed += 1;
          //0 is good, 1 is feed soon, 2 is feed asap
        }
        $scope.pet = pet;
        $scope.pets[index] = pet;
      }
      localStorageService.set(petData, $scope.pets);
  };

  $scope.undoFeed = function (index) {
    if (index >= 0) {
      var latest = $scope.pets[index].feedLog.length - 1;
      $scope.pets[index].feedLog.splice(latest, 1);
      $scope.pets[index].currentFeed -= 1;
      localStorageService.set(petData, $scope.pets);
      $scope.undoToggle = 0;
    }
  };

  $scope.openNewPetModal = function () {
      $scope.newPetModal.show();
  };

  $scope.closeNewPetModal = function () {
      $scope.newPetModal.hide();
  };

  $scope.openEditPetModal = function (index) {
      $scope.pet = $scope.pets[index];
      $scope.editPetModal.show();
      $ionicListDelegate.closeOptionButtons();
  };

  $scope.closeEditPetModal = function () {
      $scope.editPetModal.hide();
  };

  //manually clear LocalStorageModule. devtool.
  $scope.clearStorage = function () {
      var empty = [];
      localStorageService.set(petData, empty);
      $scope.getPets();
  };

});
