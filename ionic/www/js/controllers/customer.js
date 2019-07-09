/**
 * CustomerController
 *
 * This controller handles the login modal.
 *
 * @author Xtraball SAS
 */
angular.module("starter").controller("CustomerController", function(Picture, $ionicActionSheet, Loader,
                                              $ionicPopup, $ionicScrollDelegate, $rootScope, $scope, $timeout,
                                              $translate, Application, Customer, Dialog, Modal, FacebookConnect,
                                              HomepageLayout) {
    angular.extend($scope, {
        customer: Customer.customer,
        card: {},
        is_logged_in: Customer.isLoggedIn(),
        app_name: Application.app_name,
        display_login_form: (!$scope.is_logged_in) && (!Customer.display_account_form),
        display_account_form: ($scope.is_logged_in || Customer.display_account_form),
        can_connect_with_facebook: !!Customer.can_connect_with_facebook,
        show_avatar: true,
        avatar_loaded: false,
        privacy_policy: Application.privacyPolicy.text,
        privacy_policy_gdpr: Application.privacyPolicy.gdpr,
        gdpr: {
            isEnabled: Application.gdpr.isEnabled
        },
        myAccount: {
            title: $translate.instant("My account"),
            settings: {
                enable_facebook_login: true,
                enable_registration: true
            }
        }
    });

    // Alias for the global login modal!
    $scope.login = function () {
        Customer.loginModal($scope);
    };

    $scope.showAtRegistration = function (customField) {
        return ["registration", "both"].indexOf(customField.show_at) >= 0;
    };

    $scope.showAtProfile = function (customField) {
        return ["profile", "both"].indexOf(customField.show_at) >= 0;
    };

    $scope.showField = function (customField) {
        return true;
        if (Customer.isLoggedIn()) {
            return $scope.showAtProfile(customField);
        }
        return $scope.showAtRegistration(customField);
    };

    $scope._privacyPolicyModal = null;
    $scope.modalPrivacyPolicy = function () {
        Modal
        .fromTemplateUrl("templates/cms/privacypolicy/l1/modal.html", {
            scope: angular.extend($scope, {
                close: function () {
                    $scope._privacyPolicyModal.hide();
                }
            }),
            animation: "slide-in-right-left"
        }).then(function (modal) {
            $scope._privacyPolicyModal = modal;
            $scope._privacyPolicyModal.show();

            return modal;
        });
    };

    $scope.requestToken = function () {
        Customer.requestToken();
    };

    $scope.loginWithFacebook = function () {
        if ($rootScope.isNotAvailableInOverview()) {
            return;
        }
        FacebookConnect.login();
    };

    $scope.hideAvatar = function () {
        $scope.show_avatar = false;
    };

    $scope.avatarLoaded = function () {
        $scope.avatar_loaded = true;
        $scope.show_avatar = true;
    };

    $scope.editAvatar = function () {
        var buttons = [
            {
                text: $translate.instant("Edit")
            }
        ];

        if ($scope.customer.avatar !== null) {
            var text = 'Cancel ' + ($scope.customer.delete_avatar ? 'delete' : 'edit');
            buttons.push({ text: $translate.instant(text) });
        } else {
            if ($scope.customer.is_custom_image) {
                buttons.push({ text: $translate.instant('Delete') });
            }
        }

        var hideSheet = $ionicActionSheet.show({
            buttons: buttons,
            cancelText: $translate.instant('Cancel'),
            cancel: function () {
                hideSheet();
            },
            buttonClicked: function (index) {
                if (index == 0) {
                    // We have to use timeout, if we do not,
                    // next action sheet will loose focus after 400ms
                    // because of the closing one. For more details,
                    // see this : https://github.com/driftyco/ionic/blob/1.x/js/angular/service/actionSheet.js#L138
                    $timeout($scope.takePicture, 600);
                }
                if (index == 1) {
                    if ($scope.customer.avatar != null) {
                        // Cancel edit/delete :
                        $scope.customer.avatar = null;
                        $scope.customer.delete_avatar = false;
                        $scope.avatar_url = Customer.getAvatarUrl($scope.customer.id);
                    } else {
                        $scope.customer.avatar = false;
                        $scope.customer.delete_avatar = true;
                        $scope.avatar_url = Customer.getAvatarUrl($scope.customer.id, {ignore_stored: true});
                    }

                    $rootScope.$broadcast(SB.EVENTS.AUTH.editSuccess);
                }
                return true;
            }
        });
    };

    $scope.takePicture = function () {
        var cropImage = function (dataSrc) {
            $scope.cropModal = {
                original: dataSrc,
                result: null
            };

            $scope.popupShowing = false;
            $ionicPopup.show({
                template: '<div style="position: absolute" class="cropper">' +
                    '<img-crop ng-if="popupShowing" image="cropModal.original" result-image="cropModal.result" area-type="square" result-image-size="256" result-image-format="image/jpeg" result-image-quality="0.9"></img-crop>' +
                '</div>',
                cssClass: 'avatar-crop',
                scope: $scope,
                buttons: [{
                  text: $translate.instant('Cancel'),
                  type: 'button-default',
                  onTap: function(e) {
                      return false;
                  }
                }, {
                  text: $translate.instant('OK'),
                  type: 'button-positive',
                  onTap: function(e) {
                    return true;
                  }
                }]
            }).then(function(result) {
                if(result) {
                    $scope.cropModalCtrl = null;
                    $scope.avatar_url = $scope.cropModal.result;
                    $scope.customer.avatar = $scope.cropModal.result;
                    $scope.customer.delete_avatar = false;
                }
            });
            $scope.popupShowing = true;
        };

        Picture
        .takePicture(256, 256, 90)
        .then(function (response) {
            cropImage(response.image);
        });
    };

    $scope.loadContent = function () {
        // Loading my account settings!
        $scope.myAccount = Application.myAccount;

        if (!$scope.is_logged_in) {
            return;
        }

        // Force display account when logged in!
        $scope.displayAccountForm();
        Loader.show();

        $scope.customer = Customer.customer;
        $scope.customer.metadatas = _.isObject($scope.customer.metadatas) ? $scope.customer.metadatas : {};
        $scope.avatar_url = Customer.getAvatarUrl($scope.customer.id);

        HomepageLayout
            .getActiveOptions()
            .then(function (options) {
                $scope.optional_fields = {
                    ranking: !!_.find(options, {
                        use_ranking: '1'
                    }),
                    nickname: !!_.find(options, {
                        use_nickname: '1'
                    })
                };

                $scope.custom_fields = [];

                _.forEach(options, function (opt) {
                    var fields = _.get(opt, 'custom_fields');

                    if (_.isArray(fields) && fields.length > 0) {
                        $scope.custom_fields.push(_.pick(opt, ['name', 'code', 'custom_fields']));
                        _.forEach(fields, function (field) {
                            var mpath =  opt.code + '.' + field.key;
                            _.set(
                                $scope.customer.metadatas,
                                mpath,
                                _.get($scope.customer.metadatas, mpath, (field.default || null))
                            );
                        });
                    }
                });

                Loader.hide();
            });
    };

    $scope.save = function () {
        $scope.is_loading = true;

        Loader.show();

        Customer.save($scope.customer)
            .then(function (data) {
                if (angular.isDefined(data.message)) {
                    Dialog.alert('', data.message, 'OK', -1)
                        .then(function () {
                            Customer.login_modal.hide();
                        });
                }

                return data;
            }, function (data) {
                if (data && angular.isDefined(data.message)) {
                    Dialog.alert('Error', data.message, 'OK', -1);
                }

                return data;
            }).then(function () {
                $scope.is_loading = false;

                Loader.hide();
            });
    };

    $scope.logout = function () {
        Customer.logout()
            .then(function (data) {

                FacebookConnect.logout();
                if (data.success) {
                    Customer.hideModal();
                }
            });
    };

    $scope.displayLoginForm = function () {
        $scope.scrollTop();
        $scope.display_forgot_password_form = false;
        $scope.display_account_form = false;
        $scope.display_privacy_policy = false;
        $scope.display_login_form = true;
    };

    $rootScope.$on('displayLogin', function () {
        $scope.displayLoginForm();
    });

    $scope.displayForgotPasswordForm = function () {
        $scope.scrollTop();
        $scope.display_login_form = false;
        $scope.display_account_form = false;
        $scope.display_privacy_policy = false;
        $scope.display_forgot_password_form = true;
    };

    $scope.displayAccountForm = function () {
        $scope.scrollTop();
        if (!$scope.myAccount &&
            !$scope.myAccount.settings &&
            !$scope.myAccount.settings.enable_registration) {
            $scope.displayLoginForm();
        }
        $scope.display_login_form = false;
        $scope.display_forgot_password_form = false;
        $scope.display_privacy_policy = false;
        $scope.display_account_form = true;
    };

    $scope.displayPrivacyPolicy = function () {
        $scope.modalPrivacyPolicy();
    };

    $scope.scrollTop = function () {
        $ionicScrollDelegate.scrollTop(false);
    };

    $scope.unloadcard = function() {
        Dialog.confirm('Confirmation', 'Do you confirm you want to remove your card?')
            .then(function (result) {
                if (result) {
                    $scope.is_loading = true;

                    Loader.show();

                    // We cannot be there without customer!
                    Customer.removeCard()
                        .then(function (data) {
                            $scope.card = {};
                            $scope.customer.stripe = {};
                        }, function (data) {
                            if (data && angular.isDefined(data.message)) {
                                Dialog.alert('Error', data.message, 'OK', -1);
                            }
                        }).then(function () {
                            $scope.is_loading = false;
                            Loader.hide();
                        });
                }
            });
    };

    $scope.loadContent();
});
