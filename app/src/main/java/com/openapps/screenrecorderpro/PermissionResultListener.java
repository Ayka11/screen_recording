/*
 * Copyright (c) ScreenCastPro 2017.
 */

package com.openapps.screenrecorderpro;

/**
 *  11-10-2016.
 */
//Interface for permission result callback
interface PermissionResultListener {
    void onPermissionResult(int requestCode,
                            String permissions[], int[] grantResults);
}
