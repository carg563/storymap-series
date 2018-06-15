define(["lib-build/tpl!./LayerList",
    "lib-build/css!./LayerList",
    "lib-build/css!../Common",
    "storymaps/common/utils/CommonHelper",
    "esri/dijit/LayerList",
    "esri/arcgis/utils",
    "dojo/topic"
], function (viewTpl, viewCss, commonCss, CommonHelper, LayerListDijit, arcgisUtils, topic) {
    return function LayerList(response, isInBuilder, placementSettings) {
        var _this = this,
            _layerList = null,
            _settings = null,
            _container = placementSettings.container;

        var tplStrings = {
            isInBuilder: isInBuilder,
            title: i18n.viewer.mapFromCommon.layerList
        };

        if (isInBuilder) {
            tplStrings.settings = i18n.commonMapControls.common.settings;
            tplStrings.openDefault = i18n.commonMapControls.common.openDefault;
        }

        _container.html(viewTpl(tplStrings));

        this.toggle = function (activate) {
            _container.toggle(!!activate);

            if (activate)// && ! _layerList)
                display();
            else if (!activate)
                destroy();
        };

        this.toggleExpanded = function (expanded) {
            _container.find('.layerListContainer').toggleClass("collapsed", !expanded);
        };

        this.setColors = function (appColors) {
            _container.find(".layerListContainer").css({
                // TODO need to remap color before passign them to components...
                backgroundColor: appColors.mapControls,
                color: appColors.text
            });

            _container.find(".titleBtn").css("color", appColors.softText);
            _container.find(".settingsGear, .collapseBtn").css("color", appColors.softBtn);

            CommonHelper.addCSSRule(
                ".mainMediaContainer .layerListContainer ::-webkit-scrollbar-thumb { background-color:" + appColors.header + "; }",
                "MapControllayerListDropdownScrollbar"
            );
        };

        this.updatePlacementSettings = function (newSettings) {
            // Toggle inline mode
            _container.find(".layerListContainer").toggleClass("isInlined", newSettings.mode == "panel");

            // Update the _container
            if (newSettings.container[0] != _container[0]) {
                newSettings.container.html(_container.find('.layerListContainer'));
                _container = newSettings.container;
            }
        };

        function display() {
            _container.find('.layerListDijitContainer').html('<div class="layerListDijit"></div>');
            var _widgetNode = _container.find('.layerListDijit')[0];
            _layerList = new LayerListDijit({
                map: response.map,
                layers: arcgisUtils.getLayerList(response),
                removeUnderscores: true,
                showLegend: false,
                showSubLayers: true
            }, _widgetNode);
            _layerList.startup();
        }

        function destroy() {
            if (_layerList)
                _layerList.destroy();
            _layerList = null;
        }

        function toggleMinimizedState() {
            _container.find('.layerListContainer').toggleClass("collapsed");
            _container.find('.settingsOverlay').hide();
        }

        function init() {
            _container.find(".titleBtn").click(toggleMinimizedState);
            _container.find(".settingsGear").click(function () {
                if (!_container.find(".settingsOverlay").is(":visible")) {
                    _container.mouseleave(function () {
                        _container.find(".settingsOverlay").toggle();
                        _container.off('mouseleave');
                        _container.find(".content").removeClass("settingsOpen");
                    });
                }
                else
                    _container.off('mouseleave');

                _container.find(".settingsOverlay").toggle();
                _container.find(".content").toggleClass("settingsOpen");
            });

            _container.find('.expandStartup').change(onSettingsChange);

            _this.updatePlacementSettings(placementSettings);
        }

        //
        // Builder
        //

        this.setSettings = function (settings) {
            _settings = settings;
            _container.find('.expandStartup').prop('checked', _settings.openByDefault);
        };

        function onSettingsChange() {
            _settings.openByDefault = _container.find('.expandStartup').prop('checked');
            topic.publish("BUILDER_INCREMENT_COUNTER", 1);
        }

        init();
    };
});