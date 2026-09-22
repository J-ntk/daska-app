package site.daska.app;

import android.graphics.Color;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Opt out of Android 15's forced edge-to-edge/transparent system
        // bars, so the explicit colors set in styles.xml (and below) are
        // respected instead of the WebView drawing underneath them.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        super.onCreate(savedInstanceState);

        int bg = Color.parseColor("#0A0E1A");
        getWindow().setStatusBarColor(bg);
        getWindow().setNavigationBarColor(bg);
    }
}