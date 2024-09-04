<?php

/*
 * Window navigation JS package for Bear Framework
 * https://github.com/ivopetkov/window-navigation-js-bearframework-addon
 * Copyright (c) Ivo Petkov
 * Free to use under the MIT license.
 */

/**
 * @runTestsInSeparateProcesses
 */
class WindowNavigationJSTest extends BearFramework\AddonTests\PHPUnitTestCase
{

    /**
     * 
     */
    public function testOutput()
    {
        $app = $this->getApp();

        $html = '<html><head><link rel="client-packages-embed" name="windowNavigation"></head></html>';
        $result = $app->clientPackages->process($html);

        $this->assertTrue(strpos($result, 'ivoPetkov.bearFrameworkAddons.windowNavigation') !== false);
    }
}
