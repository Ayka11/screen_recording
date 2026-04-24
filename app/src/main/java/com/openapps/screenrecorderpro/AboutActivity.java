/*
 * Copyright (c) ScreenCastPro 2017.
 */

package com.openapps.screenrecorderpro;

import android.os.Bundle;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import android.text.Html;
import android.view.MenuItem;
import android.widget.TextView;

public class AboutActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Set up arrow to close the activity
        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setDisplayHomeAsUpEnabled(true);
        }
        setContentView(R.layout.activity_about);

        //Let's set the copyright and app version dynamically
        TextView appVersion = (TextView) findViewById(R.id.versionTxt);
        TextView iconCredit = (TextView) findViewById(R.id.icon_credit_tv);
        TextView dirChooserCredit = (TextView) findViewById(R.id.dir_chooser_lib_credit_tv);
        TextView openSourceInfo = (TextView) findViewById(R.id.opensource_info_tv);

        iconCredit.setText("");
        dirChooserCredit.setText("");
        openSourceInfo.setText("");

        //Let's build the copyright text using String builder
        StringBuilder copyRight = new StringBuilder();
        copyRight.append("\n");


        //If the apk is beta version include version code. Else ignore
        if (BuildConfig.VERSION_NAME.contains("Beta")) {
            copyRight.append(getResources().getString(R.string.app_name))
                    .append(" V")
                    .append(BuildConfig.VERSION_CODE)
                    .append(" ")
                    .append(BuildConfig.VERSION_NAME);
            //set the text as html to get copyright symbol
            appVersion.setText(Html.fromHtml(copyRight.toString()));
        } else {
            copyRight.append(getResources().getString(R.string.app_name))
                    .append(" V")
                    .append(BuildConfig.VERSION_NAME);
            //set the text as html to get copyright symbol
            appVersion.setText(Html.fromHtml(copyRight.toString()));
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            // Respond to the action bar's Up/Home button
            case android.R.id.home:
                //finish this activity and return to parent activity
                this.finish();
                return true;
        }
        return super.onOptionsItemSelected(item);
    }
}
