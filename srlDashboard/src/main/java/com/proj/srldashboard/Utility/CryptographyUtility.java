package com.proj.srldashboard.Utility;

import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class CryptographyUtility {

    private final String ALGORITHM = "AES/CBC/PKCS5Padding";
    private final String BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    public String generateAESKey() throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(128);
        SecretKey secretKey = keyGen.generateKey();
        return Base64.getEncoder().encodeToString(secretKey.getEncoded());
    }


    public String encrypt(String plainText, SecretKey key) throws Exception {
        byte[] ivb = new byte[16];
        new SecureRandom().nextBytes(ivb);
        IvParameterSpec iv= new IvParameterSpec(ivb);

        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, key, iv);
        byte[] cipherText = cipher.doFinal(plainText.getBytes());
        return Base64.getEncoder().encodeToString(cipherText);
    }

    public String generateShortCode(String input, String skey) throws Exception {
        //Step 1: Encrypt input
        byte[] decodedKey = Base64.getDecoder().decode(skey);
        SecretKey key= new SecretKeySpec(decodedKey, 0, decodedKey.length, "AES");
        String encryptedInput=encrypt(input,key);

        // Step 1: SHA-256 hash
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] digest = md.digest(encryptedInput.getBytes(StandardCharsets.UTF_8));

        // Step 2: Convert to positive BigInteger
        BigInteger number = new BigInteger(1, digest);

        // Step 3: Convert to Base36 (lowercase letters + digits)
        StringBuilder base36 = new StringBuilder();
        while (number.compareTo(BigInteger.ZERO) > 0) {
            int remainder = number.mod(BigInteger.valueOf(62)).intValue();
            base36.append(BASE62.charAt(remainder));
            number = number.divide(BigInteger.valueOf(62));
        }

        // Step 4: Return first 6 characters, padded if needed
        String result = base36.reverse().toString();
        return result.length() >= 6 ? result.substring(0, 6) : String.format("%6s", result).replace(' ', '0');
    }

}
